import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private sanitizeUser(user: any) {
    if (!user) return null;
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  private cleanCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  async listUsers(query?: {
    search?: string;
    role?: Role;
    status?: string;
  }) {
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
        { phone: { contains: query.search } },
        { cpf: { contains: query.search } },
      ];
      if (cleanSearch) {
        where.OR.push({ cpf: { contains: cleanSearch } });
      }
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

    return users.map((user) => this.sanitizeUser(user));
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        driver: {
          include: {
            assignments: {
              where: { isCurrent: true },
              include: { vehicle: true },
              take: 1,
            },
            trips: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return this.sanitizeUser(user);
  }

  async createUser(
    dto: CreateUserDto,
    actor?: { id: string; role: Role },
  ) {
    // 1. Validação de hierarquia de papéis
    if (actor?.role === Role.MANAGER && dto.role === Role.ADMIN) {
      throw new ForbiddenException(
        'Gerentes não têm permissão para criar usuários com perfil Administrador',
      );
    }

    // 2. Unicidade de CPF
    const rawCpf = dto.cpf.trim();
    const cleanCpf = this.cleanCpf(rawCpf);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ cpf: rawCpf }, { cpf: cleanCpf }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        `CPF ${dto.cpf} já está cadastrado no sistema para outro usuário`,
      );
    }

    // 3. Hash da senha com Argon2id
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    // 4. Execução transacional de criação
    const createdUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name.trim(),
          cpf: cleanCpf,
          phone: dto.phone?.trim() || null,
          passwordHash,
          role: dto.role,
          status: dto.status || 'ACTIVE',
        },
      });

      // Se for motorista, criar ou reaproveitar Driver
      if (dto.role === Role.DRIVER) {
        let driverId = dto.driverId;

        // Verificar se existe motorista ERP_ONLY compatível
        if (!driverId) {
          const erpDriver = await tx.driver.findFirst({
            where: {
              userId: null,
              OR: [
                { cnh: dto.cnh || undefined },
                { rntrc: dto.rntrc || undefined },
              ],
            },
          });
          if (erpDriver) {
            driverId = erpDriver.id;
          }
        }

        if (driverId) {
          const existingDriver = await tx.driver.findUnique({
            where: { id: driverId },
          });
          if (!existingDriver) {
            throw new NotFoundException(
              `Motorista com ID ${driverId} não encontrado para vínculo`,
            );
          }
          await tx.driver.update({
            where: { id: driverId },
            data: {
              userId: user.id,
              cnh: dto.cnh || existingDriver.cnh,
              cnhCategory: dto.cnhCategory || existingDriver.cnhCategory,
              rntrc: dto.rntrc || existingDriver.rntrc,
              status: 'ATIVO',
            },
          });
        } else {
          const newDriver = await tx.driver.create({
            data: {
              userId: user.id,
              cnh: dto.cnh || null,
              cnhCategory: dto.cnhCategory || null,
              rntrc: dto.rntrc || null,
              status: 'ATIVO',
            },
          });
          driverId = newDriver.id;
        }

        // Se informou veículo, vincular
        if (dto.vehicleId && driverId) {
          const vehicle = await tx.vehicle.findUnique({
            where: { id: dto.vehicleId },
          });
          if (!vehicle) {
            throw new NotFoundException(
              `Veículo com ID ${dto.vehicleId} não encontrado`,
            );
          }

          // Desativar atribuições anteriores
          await tx.driverVehicleAssignment.updateMany({
            where: { driverId, isCurrent: true },
            data: { isCurrent: false, endAt: new Date() },
          });

          // Criar nova atribuição
          await tx.driverVehicleAssignment.create({
            data: {
              driverId,
              vehicleId: dto.vehicleId,
              isCurrent: true,
              startAt: new Date(),
            },
          });
        }
      }

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'USER_CREATED',
        targetUserId: user.id,
        metadata: {
          cpf: user.cpf,
          role: user.role,
          name: user.name,
        },
        prismaClient: tx,
      });

      return user;
    });

    return this.getUserById(createdUser.id);
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    actor?: { id: string; role: Role },
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      include: { driver: true },
    });

    if (!existingUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (
      actor?.role === Role.MANAGER &&
      (existingUser.role === Role.ADMIN || dto.role === Role.ADMIN)
    ) {
      throw new ForbiddenException(
        'Gerentes não têm permissão para editar ou promover usuários Administradores',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          phone: dto.phone !== undefined ? dto.phone?.trim() : undefined,
          role: dto.role,
          status: dto.status,
        },
      });

      // Atualizar dados de motorista se aplicável
      if (dto.role === Role.DRIVER || existingUser.role === Role.DRIVER) {
        let driver = existingUser.driver;

        if (!driver) {
          driver = await tx.driver.create({
            data: {
              userId: id,
              cnh: dto.cnh || null,
              cnhCategory: dto.cnhCategory || null,
              rntrc: dto.rntrc || null,
              status: 'ATIVO',
            },
          });
        } else {
          await tx.driver.update({
            where: { id: driver.id },
            data: {
              cnh: dto.cnh !== undefined ? dto.cnh : undefined,
              cnhCategory:
                dto.cnhCategory !== undefined ? dto.cnhCategory : undefined,
              rntrc: dto.rntrc !== undefined ? dto.rntrc : undefined,
            },
          });
        }

        // Vincular veículo se solicitado
        if (dto.vehicleId) {
          const vehicle = await tx.vehicle.findUnique({
            where: { id: dto.vehicleId },
          });
          if (!vehicle) {
            throw new NotFoundException(
              `Veículo com ID ${dto.vehicleId} não encontrado`,
            );
          }

          await tx.driverVehicleAssignment.updateMany({
            where: { driverId: driver.id, isCurrent: true },
            data: { isCurrent: false, endAt: new Date() },
          });

          await tx.driverVehicleAssignment.create({
            data: {
              driverId: driver.id,
              vehicleId: dto.vehicleId,
              isCurrent: true,
              startAt: new Date(),
            },
          });
        }
      }

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'USER_UPDATED',
        targetUserId: id,
        metadata: { updates: dto },
        prismaClient: tx,
      });
    });

    return this.getUserById(id);
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
    actor?: { id: string; role: Role },
  ) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (actor?.role === Role.MANAGER && existingUser.role === Role.ADMIN) {
      throw new ForbiddenException(
        'Gerentes não podem alterar o status de Administradores',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { status: dto.status },
      });

      // Se inativar ou bloquear, revogar todos os refresh tokens
      if (dto.status !== 'ACTIVE') {
        await tx.refreshToken.updateMany({
          where: { userId: id, isRevoked: false },
          data: { isRevoked: true },
        });
      }

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'USER_STATUS_CHANGED',
        targetUserId: id,
        metadata: { oldStatus: existingUser.status, newStatus: dto.status },
        prismaClient: tx,
      });
    });

    return this.getUserById(id);
  }

  async resetPassword(
    id: string,
    dto: ResetPasswordDto,
    actor?: { id: string; role: Role },
  ) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (actor?.role === Role.MANAGER && existingUser.role === Role.ADMIN) {
      throw new ForbiddenException(
        'Gerentes não podem redefinir a senha de Administradores',
      );
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { passwordHash },
      });

      // Revogar todos os refresh tokens para forçar novo login
      await tx.refreshToken.updateMany({
        where: { userId: id, isRevoked: false },
        data: { isRevoked: true },
      });

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'USER_PASSWORD_RESET',
        targetUserId: id,
        prismaClient: tx,
      });
    });

    return {
      success: true,
      message:
        'Senha redefinida com sucesso. Todas as sessões ativas foram desconectadas.',
    };
  }

  async deleteUser(id: string, actor?: { id: string; role: Role }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        driver: {
          include: {
            trips: { select: { id: true }, take: 1 },
            settlements: { select: { id: true }, take: 1 },
            occurrences: { select: { id: true }, take: 1 },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (actor?.role === Role.MANAGER && user.role === Role.ADMIN) {
      throw new ForbiddenException(
        'Gerentes não podem excluir Administradores',
      );
    }

    const hasOperationalHistory =
      user.driver &&
      (user.driver.trips.length > 0 ||
        user.driver.settlements.length > 0 ||
        user.driver.occurrences.length > 0);

    if (hasOperationalHistory) {
      // Preservar integridade contábil/operacional: Soft Deactivation
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
          actorUserId: actor?.id || null,
          action: 'USER_SOFT_DEACTIVATED',
          targetUserId: id,
          metadata: {
            reason:
              'Usuário possui viagens/fechamentos registrados. Conta inativada para manter a rastreabilidade contábil.',
          },
          prismaClient: tx,
        });
      });

      return {
        success: true,
        action: 'SOFT_DEACTIVATED',
        message:
          'Usuário possui histórico operacional/financeiro. A conta foi desativada e as sessões revogadas para preservar a integridade contábil.',
      };
    }

    // Sem histórico operacional: remoção segura
    await this.prisma.$transaction(async (tx) => {
      if (user.driver) {
        await tx.driverVehicleAssignment.deleteMany({
          where: { driverId: user.driver.id },
        });
        await tx.driver.delete({ where: { id: user.driver.id } });
      }
      await tx.refreshToken.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'USER_DELETED',
        targetUserId: id,
        prismaClient: tx,
      });
    });

    return {
      success: true,
      action: 'DELETED',
      message: 'Usuário excluído com sucesso.',
    };
  }

  async getDashboardStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalDrivers,
      activeDrivers,
      erpOnlyDrivers,
      totalVehicles,
      activeVehicles,
      pendingTrips,
      inProgressTrips,
      completedTripsToday,
      pendingTolls,
      openOccurrences,
      pendingSettlements,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: { in: ['INACTIVE', 'BLOCKED'] } } }),
      this.prisma.driver.count(),
      this.prisma.driver.count({ where: { status: 'ATIVO' } }),
      this.prisma.driver.count({ where: { userId: null } }),
      this.prisma.vehicle.count(),
      this.prisma.vehicle.count({ where: { status: 'DISPONIVEL' } }),
      this.prisma.trip.count({ where: { status: { in: ['ASSIGNED', 'PENDING'] } } }),
      this.prisma.trip.count({ where: { status: { in: ['IN_PROGRESS', 'ACCEPTED'] } } }),
      this.prisma.trip.count({
        where: {
          status: 'COMPLETED',
          updatedAt: { gte: todayStart },
        },
      }),
      this.prisma.toll.count({ where: { status: 'PENDING' } }),
      this.prisma.occurrence.count({ where: { status: { in: ['OPEN', 'IN_REVIEW'] } } }),
      this.prisma.financialSettlement.count({ where: { status: 'PENDING' } }),
    ]);

    const availableDrivers = Math.max(0, activeDrivers - inProgressTrips);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalDrivers,
      activeDrivers,
      inTripDrivers: inProgressTrips,
      availableDrivers,
      erpOnlyDrivers,
      totalVehicles,
      activeVehicles,
      pendingTrips,
      inProgressTrips,
      completedTripsToday,
      pendingTolls,
      openOccurrences,
      pendingSettlements,
    };
  }

  async getUnlinkedDrivers() {
    return this.prisma.driver.findMany({
      where: { userId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        trips: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { tripCode: true, origin: true, destination: true },
        },
      },
    });
  }

  async getDriversList() {
    return this.prisma.driver.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
            status: true,
          },
        },
        assignments: {
          where: { isCurrent: true },
          include: { vehicle: true },
          take: 1,
        },
      },
    });
  }

  async listAllOccurrences(query?: { status?: string; type?: string }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.type) where.type = query.type;

    return this.prisma.occurrence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          include: {
            user: { select: { name: true, phone: true, cpf: true } },
          },
        },
        trip: {
          select: {
            id: true,
            tripCode: true,
            origin: true,
            destination: true,
            status: true,
          },
        },
        delivery: {
          select: {
            id: true,
            recipientName: true,
            status: true,
          },
        },
      },
    });
  }

  async updateOccurrenceStatus(id: string, status: string, actor?: { id: string }) {
    const occurrence = await this.prisma.occurrence.findUnique({ where: { id } });
    if (!occurrence) {
      throw new NotFoundException(`Ocorrência com ID ${id} não encontrada`);
    }

    const updated = await this.prisma.occurrence.update({
      where: { id },
      data: { status },
    });

    await this.auditService.log({
      actorUserId: actor?.id || null,
      action: 'OCCURRENCE_STATUS_UPDATED',
      metadata: { occurrenceId: id, previousStatus: occurrence.status, newStatus: status },
    });

    return updated;
  }

  async listTrackingLocations() {
    return this.prisma.driverLastLocation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        driver: {
          include: {
            user: { select: { name: true, phone: true } },
            assignments: {
              where: { isCurrent: true },
              include: { vehicle: true },
              take: 1,
            },
          },
        },
        trip: {
          select: {
            id: true,
            tripCode: true,
            origin: true,
            destination: true,
            status: true,
          },
        },
      },
    });
  }

  async listErpLogs(limit = 50) {
    const records = await this.prisma.idempotencyRecord.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((rec) => {
      let preview = '';
      try {
        const parsed = JSON.parse(rec.response);
        preview = parsed.message || parsed.status || 'OK';
      } catch {
        preview = rec.response.slice(0, 100);
      }
      return {
        id: rec.id,
        key: rec.key,
        endpoint: rec.endpoint || 'ERP_WEBHOOK',
        statusCode: rec.statusCode,
        preview,
        createdAt: rec.createdAt,
      };
    });
  }

  async listAuditLogs(limit = 100) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
