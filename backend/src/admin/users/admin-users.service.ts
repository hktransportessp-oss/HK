import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../../common/services/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { LinkDriverDto } from './dto/link-driver.dto';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Listar todos os usuários com dados operacionais agregados
   */
  async listUsers(query?: { search?: string; role?: Role; status?: string; hasDriver?: string }) {
    const where: any = {};

    if (query?.role) {
      where.role = query.role;
    }

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      const cleanSearch = query.search.replace(/\D/g, '');
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { cpf: { contains: cleanSearch || query.search } },
      ];
    }

    if (query?.hasDriver === 'true') {
      where.driver = { isNot: null };
    } else if (query?.hasDriver === 'false') {
      where.driver = null;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          include: {
            assignments: {
              where: { isCurrent: true },
              include: { vehicle: true },
              take: 1,
            },
          },
        },
      },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      cpf: u.cpf,
      phone: u.phone,
      role: u.role,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      driver: u.driver
        ? {
            id: u.driver.id,
            cnh: u.driver.cnh,
            cnhCategory: u.driver.cnhCategory,
            rntrc: u.driver.rntrc,
            status: u.driver.status,
          }
        : null,
      vehicle: u.driver?.assignments[0]?.vehicle
        ? {
            id: u.driver.assignments[0].vehicle.id,
            plate: u.driver.assignments[0].vehicle.plate,
            model: u.driver.assignments[0].vehicle.model,
            brand: u.driver.assignments[0].vehicle.brand,
          }
        : null,
    }));
  }

  /**
   * Obter detalhes completos de um usuário específico
   */
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        driver: {
          include: {
            assignments: {
              include: { vehicle: true },
              orderBy: { startAt: 'desc' },
            },
            trips: {
              take: 10,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        refreshTokens: {
          where: { isRevoked: false },
          select: { id: true, createdAt: true, expiresAt: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário "${id}" não encontrado`);
    }

    return {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      phone: user.phone,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      activeSessionsCount: user.refreshTokens.length,
      driver: user.driver
        ? {
            id: user.driver.id,
            cnh: user.driver.cnh,
            cnhCategory: user.driver.cnhCategory,
            rntrc: user.driver.rntrc,
            status: user.driver.status,
            currentVehicle: user.driver.assignments.find((a) => a.isCurrent)?.vehicle || null,
            assignments: user.driver.assignments,
            recentTrips: user.driver.trips,
          }
        : null,
    };
  }

  /**
   * Criar novo usuário com validação de perfil e hashing Argon2id
   */
  async createUser(dto: CreateUserDto, actor: { id: string; role: Role }) {
    // Validação de hierarquia de papéis (MANAGER só cria DRIVER ou OPERATOR)
    if (actor.role === Role.MANAGER && (dto.role === Role.ADMIN || dto.role === Role.MANAGER)) {
      throw new ForbiddenException('Gerentes só têm permissão para criar usuários MOTORISTA ou OPERADOR');
    }

    const cleanCpf = dto.cpf.replace(/\D/g, '');
    if (!cleanCpf) {
      throw new BadRequestException('CPF inválido');
    }

    // Unicidade de CPF
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ cpf: cleanCpf }, { cpf: dto.cpf }],
      },
    });

    if (existingUser) {
      throw new ConflictException(`Já existe um usuário cadastrado com o CPF "${dto.cpf}"`);
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const result = await this.prisma.$transaction(async (tx) => {
      let linkedDriverId: string | null = null;

      if (dto.driverId) {
        const driver = await tx.driver.findUnique({
          where: { id: dto.driverId },
        });

        if (!driver) {
          throw new NotFoundException(`Motorista com ID "${dto.driverId}" não encontrado`);
        }

        if (driver.userId) {
          throw new ConflictException(`Motorista "${dto.driverId}" já está vinculado a outro usuário`);
        }

        linkedDriverId = driver.id;
      }

      const user = await tx.user.create({
        data: {
          name: dto.name,
          cpf: cleanCpf,
          phone: dto.phone || null,
          passwordHash,
          role: dto.role,
          status: 'ACTIVE',
        },
      });

      // Se foi solicitado vincular a um Driver existente (ou ERP_ONLY)
      if (linkedDriverId) {
        await tx.driver.update({
          where: { id: linkedDriverId },
          data: {
            userId: user.id,
            status: 'ATIVO',
          },
        });
      } else if (dto.role === Role.DRIVER) {
        // Se o perfil for DRIVER e nenhum driverId foi especificado, cria registro de Driver correspondente
        await tx.driver.create({
          data: {
            userId: user.id,
            status: 'ATIVO',
          },
        });
      }

      await this.auditService.log({
        actorUserId: actor.id,
        action: 'USER_CREATED',
        targetUserId: user.id,
        metadata: {
          role: user.role,
          cpf: user.cpf,
          linkedDriverId,
        },
        prismaClient: tx,
      });

      return user;
    });

    return this.getUserById(result.id);
  }

  /**
   * Atualizar dados cadastrais do usuário
   */
  async updateUser(id: string, dto: UpdateUserDto, actor: { id: string; role: Role }) {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException(`Usuário "${id}" não encontrado`);
    }

    // Regras de autorização por hierarquia
    if (actor.role === Role.MANAGER) {
      if (targetUser.role === Role.ADMIN) {
        throw new ForbiddenException('Gerentes não têm permissão para editar administradores');
      }
      if (dto.role === Role.ADMIN || dto.role === Role.MANAGER) {
        throw new ForbiddenException('Gerentes não podem promover usuários a Administrador ou Gerente');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name || undefined,
        phone: dto.phone !== undefined ? dto.phone : undefined,
        role: dto.role || undefined,
        status: dto.status || undefined,
      },
    });

    await this.auditService.log({
      actorUserId: actor.id,
      action: 'USER_UPDATED',
      targetUserId: id,
      metadata: { changes: dto },
    });

    return this.getUserById(updated.id);
  }

  /**
   * Redefinir senha com Argon2id e revogação de tokens ativos
   */
  async resetPassword(id: string, dto: ResetPasswordDto, actor: { id: string; role: Role }) {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException(`Usuário "${id}" não encontrado`);
    }

    if (actor.role === Role.MANAGER && targetUser.role === Role.ADMIN) {
      throw new ForbiddenException('Gerentes não têm permissão para alterar a senha de administradores');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { passwordHash },
      });

      // Revogar todos os refresh tokens ativos
      await tx.refreshToken.updateMany({
        where: { userId: id, isRevoked: false },
        data: { isRevoked: true },
      });

      await this.auditService.log({
        actorUserId: actor.id,
        action: 'USER_PASSWORD_RESET',
        targetUserId: id,
        metadata: { reason: 'Admin/Manager password reset' },
        prismaClient: tx,
      });
    });

    return {
      success: true,
      message: 'Senha redefinida com sucesso. Todas as sessões ativas do usuário foram encerradas.',
    };
  }

  /**
   * Alterar status (ACTIVE, INACTIVE, BLOCKED)
   */
  async updateStatus(id: string, dto: UpdateStatusDto, actor: { id: string; role: Role }) {
    const targetUser = await this.prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new NotFoundException(`Usuário "${id}" não encontrado`);
    }

    if (actor.role === Role.MANAGER && targetUser.role === Role.ADMIN) {
      throw new ForbiddenException('Gerentes não podem alterar status de administradores');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { status: dto.status },
      });

      if (dto.status !== 'ACTIVE') {
        // Encerra sessões se inativado ou bloqueado
        await tx.refreshToken.updateMany({
          where: { userId: id, isRevoked: false },
          data: { isRevoked: true },
        });
      }

      await this.auditService.log({
        actorUserId: actor.id,
        action: 'USER_STATUS_CHANGED',
        targetUserId: id,
        metadata: { oldStatus: targetUser.status, newStatus: dto.status },
        prismaClient: tx,
      });
    });

    return {
      success: true,
      userId: id,
      status: dto.status,
    };
  }

  /**
   * Vincular ou desvincular Driver existente (inclusive ERP_ONLY)
   */
  async linkDriver(id: string, dto: LinkDriverDto, actor: { id: string; role: Role }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { driver: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuário "${id}" não encontrado`);
    }

    await this.prisma.$transaction(async (tx) => {
      // Se já tinha driver vinculado e quer desvincular/mudar
      if (user.driver) {
        await tx.driver.update({
          where: { id: user.driver.id },
          data: { userId: null },
        });
      }

      if (dto.driverId) {
        const targetDriver = await tx.driver.findUnique({
          where: { id: dto.driverId },
        });

        if (!targetDriver) {
          throw new NotFoundException(`Motorista "${dto.driverId}" não encontrado`);
        }

        if (targetDriver.userId && targetDriver.userId !== user.id) {
          throw new ConflictException(`Motorista "${dto.driverId}" já está associado a outro usuário`);
        }

        await tx.driver.update({
          where: { id: targetDriver.id },
          data: {
            userId: user.id,
            status: 'ATIVO',
          },
        });
      }

      await this.auditService.log({
        actorUserId: actor.id,
        action: 'USER_DRIVER_LINKED',
        targetUserId: id,
        metadata: {
          previousDriverId: user.driver?.id || null,
          newDriverId: dto.driverId || null,
        },
        prismaClient: tx,
      });
    });

    return this.getUserById(id);
  }

  /**
   * Exclusão segura: soft-deactivate se houver histórico; exclusão física se nunca utilizado
   */
  async deleteUser(id: string, actor: { id: string; role: Role }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        driver: {
          include: {
            trips: { take: 1 },
            occurrences: { take: 1 },
            settlements: { take: 1 },
            assignments: { take: 1 },
          },
        },
        refreshTokens: { take: 1 },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário "${id}" não encontrado`);
    }

    if (actor.role === Role.MANAGER && user.role === Role.ADMIN) {
      throw new ForbiddenException('Gerentes não podem remover administradores');
    }

    const hasHistory =
      Boolean(user.refreshTokens.length > 0) ||
      Boolean(user.driver?.trips?.length) ||
      Boolean(user.driver?.occurrences?.length) ||
      Boolean(user.driver?.settlements?.length) ||
      Boolean(user.driver?.assignments?.length);

    if (hasHistory) {
      // Soft deactivate
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id },
          data: { status: 'INACTIVE' },
        });

        await tx.refreshToken.updateMany({
          where: { userId: id, isRevoked: false },
          data: { isRevoked: true },
        });

        await this.auditService.log({
          actorUserId: actor.id,
          action: 'USER_DEACTIVATED',
          targetUserId: id,
          metadata: { reason: 'Desativado devido a histórico operacional/financeiro preservado' },
          prismaClient: tx,
        });
      });

      return {
        success: true,
        action: 'SOFT_DEACTIVATED',
        message: 'Usuário desativado com sucesso (histórico operacional preservado por segurança).',
      };
    }

    // Safe physical deletion
    await this.prisma.$transaction(async (tx) => {
      if (user.driver) {
        await tx.driver.delete({ where: { id: user.driver.id } });
      }
      await tx.user.delete({ where: { id } });

      await this.auditService.log({
        actorUserId: actor.id,
        action: 'USER_DELETED',
        targetUserId: id,
        metadata: { physical: true },
        prismaClient: tx,
      });
    });

    return {
      success: true,
      action: 'PHYSICALLY_DELETED',
      message: 'Usuário sem histórico excluído permanentemente com sucesso.',
    };
  }
}
