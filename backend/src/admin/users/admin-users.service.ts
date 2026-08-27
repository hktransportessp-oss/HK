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
import { Role, TripStatus, RomaneioStatus, TollStatus, InvoiceStatus, DeliveryStatus } from '@prisma/client';
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

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalDrivers,
      activeDrivers,
      erpOnlyDrivers,
      driversWithoutVehicle,
      totalVehicles,
      activeVehicles,
      pendingTrips,
      inProgressTrips,
      completedTrips,
      completedTripsToday,
      pendingTolls,
      pendingRomaneios,
      openOccurrences,
      pendingSettlementsCount,
      pendingSettlementsAggregate,
      pendingTollsAggregate,
      recentLocationsCount,
      erpFailuresCount,
      recentTrips,
      inProgressTripsList,
      recentOccurrences,
      recentTolls,
      unassignedDrivers,
      unlinkedDriversList,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: { in: ['INACTIVE', 'BLOCKED'] } } }),
      this.prisma.driver.count(),
      this.prisma.driver.count({ where: { status: 'ATIVO' } }),
      this.prisma.driver.count({ where: { userId: null } }),
      this.prisma.driver.count({
        where: {
          assignments: {
            none: { isCurrent: true },
          },
        },
      }),
      this.prisma.vehicle.count(),
      this.prisma.vehicle.count({ where: { status: { not: 'INATIVO' } } }),
      this.prisma.trip.count({ where: { status: { in: ['ASSIGNED', 'PENDING', 'ACCEPTED'] } } }),
      this.prisma.trip.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.trip.count({ where: { status: 'COMPLETED' } }),
      this.prisma.trip.count({
        where: {
          status: 'COMPLETED',
          updatedAt: { gte: todayStart },
        },
      }),
      this.prisma.toll.count({ where: { status: 'PENDING' } }),
      this.prisma.romaneio.count({ where: { status: 'PENDING' } }),
      this.prisma.occurrence.count({ where: { status: { in: ['OPEN', 'IN_ANALYSIS', 'IN_REVIEW'] } } }),
      this.prisma.financialSettlement.count({ where: { status: 'PENDING' } }),
      this.prisma.financialSettlement.aggregate({
        where: { status: 'PENDING' },
        _sum: { netAmount: true },
      }),
      this.prisma.toll.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.driverLastLocation.count({
        where: { capturedAt: { gte: fifteenMinutesAgo } },
      }),
      this.prisma.idempotencyRecord.count({
        where: { statusCode: { gte: 400 } },
      }),
      this.prisma.trip.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          driver: { include: { user: { select: { name: true, phone: true } } } },
          vehicle: { select: { plate: true, model: true, brand: true } },
        },
      }),
      this.prisma.trip.findMany({
        where: { status: 'IN_PROGRESS' },
        take: 8,
        orderBy: { startDate: 'desc' },
        include: {
          driver: { include: { user: { select: { name: true, phone: true } } } },
          vehicle: { select: { plate: true, model: true } },
        },
      }),
      this.prisma.occurrence.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          driver: { include: { user: { select: { name: true } } } },
          trip: { select: { tripCode: true } },
        },
      }),
      this.prisma.toll.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          driver: { include: { user: { select: { name: true } } } },
          trip: { select: { tripCode: true } },
        },
      }),
      this.prisma.driver.findMany({
        where: {
          assignments: {
            none: { isCurrent: true },
          },
        },
        take: 8,
        include: {
          user: { select: { id: true, name: true, phone: true, cpf: true } },
        },
      }),
      this.prisma.driver.findMany({
        where: { userId: null },
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const availableDrivers = Math.max(0, activeDrivers - inProgressTrips);
    const driversNoSignalCount = Math.max(0, activeDrivers - recentLocationsCount);
    const pendingSettlementsAmount = pendingSettlementsAggregate._sum.netAmount || 0;
    const pendingTollsAmount = pendingTollsAggregate._sum.amount || 0;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalDrivers,
      activeDrivers,
      inTripDrivers: inProgressTrips,
      availableDrivers,
      driversWithoutVehicle,
      erpOnlyDrivers,
      totalVehicles,
      activeVehicles,
      pendingTrips,
      inProgressTrips,
      completedTrips,
      completedTripsToday,
      pendingTolls,
      pendingTollsAmount,
      pendingRomaneios,
      openOccurrences,
      pendingSettlements: pendingSettlementsCount,
      pendingSettlementsCount,
      pendingSettlementsAmount,
      driversNoSignalCount,
      recentLocationsCount,
      erpFailuresCount,
      recentTrips,
      inProgressTripsList,
      recentOccurrences,
      recentTolls,
      unassignedDrivers,
      unlinkedDriversList,
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

  async listAllOccurrences(query?: {
    status?: string;
    type?: string;
    driverId?: string;
    tripId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.type) where.type = query.type;
    if (query?.driverId) where.driverId = query.driverId;
    if (query?.tripId) where.tripId = query.tripId;

    if (query?.search) {
      const clean = query.search.trim();
      where.OR = [
        { title: { contains: clean, mode: 'insensitive' } },
        { description: { contains: clean, mode: 'insensitive' } },
        { trip: { tripCode: { contains: clean, mode: 'insensitive' } } },
        { driver: { user: { name: { contains: clean, mode: 'insensitive' } } } },
      ];
    }

    if (query?.startDate) {
      where.createdAt = { ...(where.createdAt || {}), gte: new Date(query.startDate) };
    }
    if (query?.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { ...(where.createdAt || {}), lte: end };
    }

    return this.prisma.occurrence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          include: {
            user: { select: { id: true, name: true, phone: true, cpf: true } },
          },
        },
        trip: {
          select: {
            id: true,
            tripCode: true,
            origin: true,
            destination: true,
            status: true,
            vehicle: { select: { id: true, plate: true, model: true } },
          },
        },
        delivery: {
          select: {
            id: true,
            recipient: true,
            status: true,
            city: true,
            state: true,
          },
        },
      },
    });
  }

  async updateOccurrenceStatus(
    id: string,
    status: string,
    resolutionNotes?: string,
    actor?: { id: string },
  ) {
    const occurrence = await this.prisma.occurrence.findUnique({ where: { id } });
    if (!occurrence) {
      throw new NotFoundException(`Ocorrência com ID ${id} não encontrada`);
    }

    const updateData: any = { status };
    if (resolutionNotes) {
      updateData.description = occurrence.description
        ? `${occurrence.description}\n[Atualização Admin]: ${resolutionNotes}`
        : resolutionNotes;
    }

    const updated = await this.prisma.occurrence.update({
      where: { id },
      data: updateData,
      include: {
        driver: { include: { user: { select: { name: true } } } },
        trip: true,
      },
    });

    await this.auditService.log({
      actorUserId: actor?.id || null,
      action: 'OCCURRENCE_STATUS_UPDATED',
      metadata: {
        occurrenceId: id,
        previousStatus: occurrence.status,
        newStatus: status,
        resolutionNotes,
      },
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

  async listAuditLogs(limit = 100, query?: { userId?: string; action?: string }) {
    const where: any = {};
    if (query?.userId) where.actorUserId = query.userId;
    if (query?.action) where.action = query.action;

    return this.prisma.auditLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDriverDetails(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
            role: true,
            status: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        assignments: {
          orderBy: { createdAt: 'desc' },
          include: { vehicle: true },
        },
        trips: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            vehicle: { select: { plate: true, model: true } },
            _count: { select: { deliveries: true, invoices: true, occurrences: true } },
          },
        },
        tolls: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { receipts: true },
        },
        settlements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { items: true, payments: true },
        },
        occurrences: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { trip: { select: { tripCode: true } } },
        },
        lastLocation: true,
      },
    });

    if (!driver) {
      throw new NotFoundException(`Motorista com ID ${driverId} não encontrado`);
    }

    return driver;
  }

  async assignDriverVehicle(driverId: string, vehicleId: string, actor?: { id: string }) {
    const driver = await this.prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) throw new NotFoundException(`Motorista não encontrado`);

    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException(`Veículo não encontrado`);

    return this.prisma.$transaction(async (tx) => {
      // 1. Fechar vínculos atuais do motorista e do veículo
      await tx.driverVehicleAssignment.updateMany({
        where: {
          OR: [{ driverId, isCurrent: true }, { vehicleId, isCurrent: true }],
        },
        data: { isCurrent: false, endAt: new Date() },
      });

      // 2. Criar novo vínculo
      const assignment = await tx.driverVehicleAssignment.create({
        data: {
          driverId,
          vehicleId,
          isCurrent: true,
          startAt: new Date(),
        },
        include: { vehicle: true, driver: { include: { user: true } } },
      });

      // 3. Atualizar status do veículo para EM_USO se ativo
      if (vehicle.status === 'DISPONIVEL') {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { status: 'EM_USO' },
        });
      }

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'DRIVER_VEHICLE_ASSIGNED',
        targetUserId: driver.userId || null,
        metadata: { driverId, vehicleId, plate: vehicle.plate },
        prismaClient: tx,
      });

      return assignment;
    });
  }

  async unassignDriverVehicle(driverId: string, actor?: { id: string }) {
    const currentAssignment = await this.prisma.driverVehicleAssignment.findFirst({
      where: { driverId, isCurrent: true },
      include: { vehicle: true },
    });

    if (!currentAssignment) {
      throw new BadRequestException('Motorista não possui nenhum veículo vinculado no momento.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.driverVehicleAssignment.update({
        where: { id: currentAssignment.id },
        data: { isCurrent: false, endAt: new Date() },
      });

      if (currentAssignment.vehicle) {
        await tx.vehicle.update({
          where: { id: currentAssignment.vehicleId },
          data: { status: 'DISPONIVEL' },
        });
      }

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'DRIVER_VEHICLE_UNASSIGNED',
        targetUserId: null,
        metadata: { driverId, vehicleId: currentAssignment.vehicleId },
        prismaClient: tx,
      });

      return { success: true, message: 'Vínculo desfeito com sucesso.' };
    });
  }

  async updateDriverStatus(driverId: string, status: string, actor?: { id: string }) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      include: { user: true },
    });
    if (!driver) throw new NotFoundException('Motorista não encontrado');

    const updated = await this.prisma.driver.update({
      where: { id: driverId },
      data: { status },
    });

    // Se possui usuário vinculado, alinhar status do User
    if (driver.userId) {
      const userStatus = status === 'ATIVO' ? 'ACTIVE' : status === 'BLOQUEADO' ? 'BLOCKED' : 'INACTIVE';
      await this.prisma.user.update({
        where: { id: driver.userId },
        data: { status: userStatus },
      });
    }

    await this.auditService.log({
      actorUserId: actor?.id || null,
      action: 'DRIVER_STATUS_UPDATED',
      targetUserId: driver.userId || null,
      metadata: { driverId, previousStatus: driver.status, newStatus: status },
    });

    return updated;
  }

  async listAdminTrips(query?: {
    status?: string;
    driverId?: string;
    vehicleId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};

    if (query?.status) where.status = query.status;
    if (query?.driverId) where.driverId = query.driverId;
    if (query?.vehicleId) where.vehicleId = query.vehicleId;

    if (query?.search) {
      where.OR = [
        { tripCode: { contains: query.search.trim(), mode: 'insensitive' } },
        { origin: { contains: query.search.trim(), mode: 'insensitive' } },
        { destination: { contains: query.search.trim(), mode: 'insensitive' } },
        { driver: { user: { name: { contains: query.search.trim(), mode: 'insensitive' } } } },
        { vehicle: { plate: { contains: query.search.trim().toUpperCase() } } },
      ];
    }

    if (query?.startDate) {
      where.createdAt = { ...(where.createdAt || {}), gte: new Date(query.startDate) };
    }
    if (query?.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { ...(where.createdAt || {}), lte: end };
    }

    return this.prisma.trip.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          include: {
            user: { select: { id: true, name: true, phone: true, cpf: true } },
          },
        },
        vehicle: true,
        _count: {
          select: {
            stops: true,
            deliveries: true,
            invoices: true,
            ctes: true,
            romaneios: true,
            tolls: true,
            occurrences: true,
          },
        },
      },
    });
  }

  async getAdminTripById(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        driver: {
          include: {
            user: { select: { id: true, name: true, phone: true, cpf: true, status: true } },
          },
        },
        vehicle: true,
        stops: { orderBy: { stopOrder: 'asc' } },
        deliveries: {
          orderBy: { sequence: 'asc' },
          include: {
            invoices: true,
            occurrences: true,
          },
        },
        invoices: true,
        ctes: true,
        romaneios: {
          include: { documents: true },
        },
        tolls: {
          include: { receipts: true },
        },
        settlements: {
          include: { items: true, payments: true },
        },
        occurrences: true,
        lastLocations: {
          take: 1,
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Viagem com ID ${id} não encontrada`);
    }

    return trip;
  }

  async updateAdminTripStatus(
    id: string,
    status: TripStatus,
    notes?: string,
    actor?: { id: string },
  ) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: { include: { user: true } } },
    });
    if (!trip) throw new NotFoundException(`Viagem com ID ${id} não encontrada`);

    if (trip.status === status) {
      return trip;
    }

    // Regras de transição estrita
    if (trip.status === TripStatus.COMPLETED) {
      throw new BadRequestException('Viagem já concluída não pode ter seu status alterado.');
    }

    if (trip.status === TripStatus.CANCELLED) {
      throw new BadRequestException('Viagem cancelada não pode ser reativada.');
    }

    if (status === TripStatus.COMPLETED) {
      if (trip.status !== TripStatus.IN_PROGRESS) {
        throw new BadRequestException('Apenas viagens em andamento (EM_ANDAMENTO) podem ser concluídas.');
      }
    }

    if (status === TripStatus.IN_PROGRESS) {
      const allowedPrevious = [TripStatus.ASSIGNED, TripStatus.PENDING, TripStatus.ACCEPTED];
      if (!allowedPrevious.includes(trip.status)) {
        throw new BadRequestException(`Não é possível iniciar viagem que está no status ${trip.status}.`);
      }
    }

    const updateData: any = { status };
    if (notes) updateData.notes = notes;
    if (status === TripStatus.COMPLETED && !trip.endDate) {
      updateData.endDate = new Date();
    }
    if (status === TripStatus.IN_PROGRESS && !trip.startDate) {
      updateData.startDate = new Date();
    }

    const updated = await this.prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        driver: { include: { user: { select: { name: true, phone: true } } } },
        vehicle: true,
      },
    });

    await this.auditService.log({
      actorUserId: actor?.id || null,
      action: 'ADMIN_TRIP_STATUS_UPDATED',
      metadata: { tripId: id, tripCode: trip.tripCode, previousStatus: trip.status, newStatus: status, notes },
    });

    return updated;
  }

  async listAdminRomaneios(query?: {
    status?: RomaneioStatus;
    driverId?: string;
    tripId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.driverId) where.driverId = query.driverId;
    if (query?.tripId) where.tripId = query.tripId;

    if (query?.search) {
      const clean = query.search.trim();
      where.OR = [
        { romaneioCode: { contains: clean, mode: 'insensitive' } },
        { driver: { user: { name: { contains: clean, mode: 'insensitive' } } } },
        { trip: { tripCode: { contains: clean, mode: 'insensitive' } } },
      ];
    }

    if (query?.startDate) {
      where.createdAt = { ...(where.createdAt || {}), gte: new Date(query.startDate) };
    }
    if (query?.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { ...(where.createdAt || {}), lte: end };
    }

    return this.prisma.romaneio.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          include: {
            user: { select: { id: true, name: true, phone: true, cpf: true } },
          },
        },
        trip: {
          select: {
            id: true,
            tripCode: true,
            origin: true,
            destination: true,
            vehicle: { select: { id: true, plate: true, model: true } },
          },
        },
        documents: true,
      },
    });
  }

  async getAdminRomaneioById(id: string) {
    const romaneio = await this.prisma.romaneio.findUnique({
      where: { id },
      include: {
        driver: {
          include: {
            user: { select: { id: true, name: true, phone: true, cpf: true } },
          },
        },
        trip: {
          include: {
            vehicle: true,
            invoices: true,
          },
        },
        documents: true,
      },
    });

    if (!romaneio) throw new NotFoundException(`Romaneio não encontrado`);
    return romaneio;
  }

  async updateAdminRomaneioStatus(
    id: string,
    status: RomaneioStatus,
    notes?: string,
    actor?: { id: string },
  ) {
    const romaneio = await this.prisma.romaneio.findUnique({ where: { id } });
    if (!romaneio) throw new NotFoundException(`Romaneio não encontrado`);

    const updateData: any = { status };
    if (notes) updateData.notes = notes;

    const updated = await this.prisma.romaneio.update({
      where: { id },
      data: updateData,
    });

    await this.auditService.log({
      actorUserId: actor?.id || null,
      action: 'ADMIN_ROMANEIO_STATUS_UPDATED',
      metadata: { romaneioId: id, romaneioCode: romaneio.romaneioCode, previousStatus: romaneio.status, newStatus: status, notes },
    });

    return updated;
  }

  async listAdminInvoices(query?: {
    status?: InvoiceStatus;
    tripId?: string;
    driverId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.tripId) where.tripId = query.tripId;
    if (query?.driverId) where.trip = { driverId: query.driverId };

    if (query?.search) {
      const clean = query.search.trim();
      where.OR = [
        { number: { contains: clean } },
        { accessKey: { contains: clean } },
        { recipient: { contains: clean, mode: 'insensitive' } },
        { trip: { tripCode: { contains: clean, mode: 'insensitive' } } },
        { trip: { driver: { user: { name: { contains: clean, mode: 'insensitive' } } } } },
      ];
    }

    if (query?.startDate) {
      where.createdAt = { ...(where.createdAt || {}), gte: new Date(query.startDate) };
    }
    if (query?.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { ...(where.createdAt || {}), lte: end };
    }

    return this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        trip: {
          select: {
            id: true,
            tripCode: true,
            driver: { include: { user: { select: { name: true, phone: true } } } },
            vehicle: { select: { id: true, plate: true, model: true } },
          },
        },
        delivery: {
          select: {
            id: true,
            recipient: true,
            status: true,
            city: true,
            state: true,
            address: true,
          },
        },
      },
    });
  }

  async getAdminInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            driver: { include: { user: true } },
            vehicle: true,
          },
        },
        delivery: {
          include: {
            occurrences: true,
          },
        },
      },
    });

    if (!invoice) throw new NotFoundException(`Nota Fiscal não encontrada`);
    return invoice;
  }

  async listAdminTolls(query?: {
    status?: TollStatus;
    driverId?: string;
    tripId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.driverId) where.driverId = query.driverId;
    if (query?.tripId) where.tripId = query.tripId;

    if (query?.search) {
      const clean = query.search.trim();
      where.OR = [
        { plazaName: { contains: clean, mode: 'insensitive' } },
        { highway: { contains: clean, mode: 'insensitive' } },
        { trip: { tripCode: { contains: clean, mode: 'insensitive' } } },
        { driver: { user: { name: { contains: clean, mode: 'insensitive' } } } },
      ];
    }

    if (query?.startDate) {
      where.createdAt = { ...(where.createdAt || {}), gte: new Date(query.startDate) };
    }
    if (query?.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { ...(where.createdAt || {}), lte: end };
    }

    return this.prisma.toll.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          include: {
            user: { select: { id: true, name: true, phone: true, cpf: true } },
          },
        },
        trip: {
          select: {
            id: true,
            tripCode: true,
            origin: true,
            destination: true,
            vehicle: { select: { id: true, plate: true, model: true } },
          },
        },
        receipts: true,
      },
    });
  }

  async getAdminTollById(id: string) {
    const toll = await this.prisma.toll.findUnique({
      where: { id },
      include: {
        driver: {
          include: {
            user: { select: { id: true, name: true, phone: true, cpf: true } },
          },
        },
        trip: {
          include: {
            vehicle: true,
          },
        },
        receipts: true,
      },
    });

    if (!toll) throw new NotFoundException(`Pedágio não encontrado`);
    return toll;
  }

  async updateAdminTollStatus(
    id: string,
    status: TollStatus,
    notes?: string,
    actor?: { id: string },
  ) {
    const toll = await this.prisma.toll.findUnique({ where: { id } });
    if (!toll) throw new NotFoundException(`Pedágio não encontrado`);

    const updated = await this.prisma.toll.update({
      where: { id },
      data: { status },
    });

    await this.auditService.log({
      actorUserId: actor?.id || null,
      action: 'ADMIN_TOLL_STATUS_UPDATED',
      metadata: { tollId: id, previousStatus: toll.status, newStatus: status, amount: toll.amount, notes },
    });

    return updated;
  }

  async listAdminSettlements(query?: {
    status?: string;
    driverId?: string;
    period?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.driverId) where.driverId = query.driverId;
    if (query?.period) {
      where.OR = [
        { periodStart: { contains: query.period } },
        { periodEnd: { contains: query.period } },
        { settlementCode: { contains: query.period, mode: 'insensitive' } },
      ];
    }

    if (query?.search) {
      const clean = query.search.trim();
      where.OR = [
        { settlementCode: { contains: clean, mode: 'insensitive' } },
        { driver: { user: { name: { contains: clean, mode: 'insensitive' } } } },
        { driver: { user: { cpf: { contains: clean } } } },
        { trip: { tripCode: { contains: clean, mode: 'insensitive' } } },
      ];
    }

    if (query?.startDate) {
      where.createdAt = { ...(where.createdAt || {}), gte: new Date(query.startDate) };
    }
    if (query?.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { ...(where.createdAt || {}), lte: end };
    }

    return this.prisma.financialSettlement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          include: {
            user: { select: { id: true, name: true, phone: true, cpf: true } },
          },
        },
        trip: { select: { id: true, tripCode: true, origin: true, destination: true } },
        items: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
  }

  async getAdminSettlementById(id: string) {
    const settlement = await this.prisma.financialSettlement.findUnique({
      where: { id },
      include: {
        driver: {
          include: {
            user: { select: { id: true, name: true, phone: true, cpf: true } },
          },
        },
        trip: {
          include: {
            vehicle: true,
            invoices: true,
          },
        },
        items: {
          orderBy: { createdAt: 'asc' },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!settlement) throw new NotFoundException(`Fechamento financeiro não encontrado`);
    return settlement;
  }

  async updateAdminSettlementStatus(
    id: string,
    data: {
      status: string;
      notes?: string;
      paymentMethod?: string;
      transactionId?: string;
      receiptUrl?: string;
    },
    actor?: { id: string },
  ) {
    const settlement = await this.prisma.financialSettlement.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!settlement) throw new NotFoundException(`Fechamento financeiro não encontrado`);

    const result = await this.prisma.$transaction(async (tx) => {
      // Se status for marcado como PAID e ainda não tiver pagamento registrado com o valor total
      if (data.status === 'PAID') {
        const hasFullPayment = settlement.payments.some((p) => p.status === 'PAID' && p.amount >= settlement.netAmount);
        if (!hasFullPayment) {
          await tx.payment.create({
            data: {
              settlementId: id,
              amount: settlement.netAmount,
              paymentMethod: data.paymentMethod || 'PIX',
              transactionId: data.transactionId || `ADMIN-PAY-${Date.now()}`,
              receiptUrl: data.receiptUrl || null,
              status: 'PAID',
              paymentDate: new Date(),
            },
          });
        }
      }

      const updated = await tx.financialSettlement.update({
        where: { id },
        data: {
          status: data.status,
          updatedAt: new Date(),
        },
        include: {
          driver: { include: { user: true } },
          items: true,
          payments: true,
        },
      });

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'ADMIN_SETTLEMENT_STATUS_UPDATED',
        prismaClient: tx,
        metadata: {
          settlementId: id,
          settlementCode: settlement.settlementCode,
          previousStatus: settlement.status,
          newStatus: data.status,
          netAmount: settlement.netAmount,
          notes: data.notes,
          transactionId: data.transactionId,
        },
      });

      return updated;
    });

    return result;
  }

  async listTrackingLocations() {
    const now = Date.now();
    const fifteenMinutesMs = 15 * 60 * 1000;
    const twoHoursMs = 2 * 60 * 60 * 1000;

    // Buscar todos os motoristas com seus vínculos ativos, viagem atual e última localização
    const drivers = await this.prisma.driver.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            cpf: true,
            status: true,
          },
        },
        assignments: {
          where: { isCurrent: true },
          include: { vehicle: true },
          take: 1,
        },
        trips: {
          where: { status: 'IN_PROGRESS' },
          take: 1,
          select: {
            id: true,
            tripCode: true,
            origin: true,
            destination: true,
            status: true,
            startDate: true,
            vehicle: { select: { plate: true, model: true } },
          },
        },
        lastLocation: true,
      },
    });

    let recentCount = 0;
    let outdatedCount = 0;
    let noSignalCount = 0;
    let inTripCount = 0;

    const list = drivers.map((d) => {
      const loc = d.lastLocation;
      const activeTrip = d.trips && d.trips.length > 0 ? d.trips[0] : null;
      if (activeTrip) inTripCount++;

      let telemetryStatus: 'RECENT' | 'OUTDATED' | 'NO_SIGNAL' = 'NO_SIGNAL';
      let statusLabel = 'SEM SINAL';
      let minutesSinceLastUpdate: number | null = null;

      if (loc && loc.capturedAt) {
        const capturedTime = new Date(loc.capturedAt).getTime();
        const diffMs = Math.max(0, now - capturedTime);
        minutesSinceLastUpdate = Math.round(diffMs / 60000);

        if (diffMs <= fifteenMinutesMs) {
          telemetryStatus = 'RECENT';
          statusLabel = 'RECENTE';
          recentCount++;
        } else if (diffMs <= twoHoursMs) {
          telemetryStatus = 'OUTDATED';
          statusLabel = 'DESATUALIZADA';
          outdatedCount++;
        } else {
          telemetryStatus = 'NO_SIGNAL';
          statusLabel = 'SEM SINAL';
          noSignalCount++;
        }
      } else {
        noSignalCount++;
      }

      const vehicle = activeTrip?.vehicle || (d.assignments[0]?.vehicle ? d.assignments[0].vehicle : null);

      return {
        driverId: d.id,
        driverName: d.user?.name || 'Motorista ERP',
        driverPhone: d.user?.phone || null,
        driverCpf: d.user?.cpf || null,
        userStatus: d.user?.status || 'INACTIVE',
        vehiclePlate: vehicle?.plate || '-',
        vehicleModel: vehicle?.model || '',
        activeTrip: activeTrip
          ? {
              id: activeTrip.id,
              tripCode: activeTrip.tripCode,
              origin: activeTrip.origin,
              destination: activeTrip.destination,
              startDate: activeTrip.startDate,
            }
          : null,
        telemetry: loc
          ? {
              latitude: loc.latitude,
              longitude: loc.longitude,
              speed: loc.speed !== null ? Math.round(loc.speed) : null,
              accuracy: loc.accuracy !== null ? Math.round(loc.accuracy) : null,
              heading: loc.heading !== null ? Math.round(loc.heading) : null,
              capturedAt: loc.capturedAt,
              receivedAt: loc.receivedAt,
            }
          : null,
        telemetryStatus,
        statusLabel,
        minutesSinceLastUpdate,
      };
    });

    return {
      stats: {
        totalDrivers: drivers.length,
        inTripCount,
        recentCount,
        outdatedCount,
        noSignalCount,
      },
      drivers: list,
    };
  }

  async listErpLogs(options?: {
    direction?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const limit = options?.limit ? Number(options.limit) : 50;

    // 1. Inbound Logs (IdempotencyRecord)
    const idempotencyWhere: any = {};
    if (options?.search) {
      const clean = options.search.trim();
      idempotencyWhere.OR = [
        { key: { contains: clean, mode: 'insensitive' } },
        { endpoint: { contains: clean, mode: 'insensitive' } },
      ];
    }
    if (options?.startDate) {
      idempotencyWhere.createdAt = { ...(idempotencyWhere.createdAt || {}), gte: new Date(options.startDate) };
    }
    if (options?.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      idempotencyWhere.createdAt = { ...(idempotencyWhere.createdAt || {}), lte: end };
    }
    if (options?.status === 'SUCCESS') {
      idempotencyWhere.statusCode = { lt: 400 };
    } else if (options?.status === 'ERROR') {
      idempotencyWhere.statusCode = { gte: 400 };
    }

    const inboundRecords = await this.prisma.idempotencyRecord.findMany({
      where: idempotencyWhere,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const inboundFormatted = inboundRecords.map((r) => {
      let parsed: any = null;
      try {
        parsed = JSON.parse(r.response);
      } catch {
        parsed = { raw: r.response };
      }

      // Sanitizar respostas para nunca expor dados sensíveis
      if (parsed) {
        delete parsed.apiKey;
        delete parsed.secret;
        delete parsed.token;
        delete parsed.password;
        delete parsed.passwordHash;
      }

      const isError = r.statusCode >= 400 || (parsed && parsed.status === 'ERROR');

      return {
        id: r.id,
        direction: 'INBOUND' as const,
        directionLabel: 'ERP → HK CONNECT',
        event: parsed?.event || r.endpoint || 'erp.webhook.received',
        externalId: parsed?.externalId || parsed?.settlementCode || parsed?.paymentId || r.key,
        idempotencyKey: r.key,
        endpoint: r.endpoint || '/api/v1/integrations/erp/*',
        statusCode: r.statusCode,
        status: isError ? 'ERROR' : 'PROCESSED',
        statusLabel: isError ? 'ERRO' : 'PROCESSADO',
        error: isError ? (parsed?.message || parsed?.error || 'Erro no processamento do evento ERP') : null,
        receivedAt: r.createdAt,
        processedAt: r.updatedAt,
        summary: parsed?.message || (parsed?.success ? 'Evento processado com sucesso' : 'Evento registrado'),
        payloadSummary: parsed,
      };
    });

    // 2. Outbound Events (AuditLog / HK CONNECT -> ERP)
    const outboundWhere: any = {
      action: { in: ['ERP_OUTBOUND_EVENT', 'POD_SENT_TO_ERP', 'OCCURRENCE_NOTIFIED_ERP', 'DELIVERY_STATUS_SYNCED'] },
    };
    if (options?.search) {
      const clean = options.search.trim();
      outboundWhere.OR = [
        { action: { contains: clean, mode: 'insensitive' } },
      ];
    }
    if (options?.startDate) {
      outboundWhere.createdAt = { ...(outboundWhere.createdAt || {}), gte: new Date(options.startDate) };
    }
    if (options?.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      outboundWhere.createdAt = { ...(outboundWhere.createdAt || {}), lte: end };
    }

    const outboundRecords = await this.prisma.auditLog.findMany({
      where: outboundWhere,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const outboundFormatted = outboundRecords.map((a) => {
      const meta = (a.metadata as any) || {};
      return {
        id: a.id,
        direction: 'OUTBOUND' as const,
        directionLabel: 'HK CONNECT → ERP',
        event: meta.event || a.action,
        externalId: meta.externalId || meta.tripCode || meta.documentNumber || a.targetUserId || '-',
        idempotencyKey: meta.idempotencyKey || `OUT-${a.id.slice(0, 8)}`,
        endpoint: meta.webhookUrl || 'HK ERP Webhook Queue',
        statusCode: meta.statusCode || 200,
        status: meta.status || 'PROCESSED',
        statusLabel: meta.status === 'ERROR' ? 'ERRO' : (meta.status === 'PENDING' ? 'PENDENTE' : 'ENVIADO'),
        error: meta.error || null,
        receivedAt: a.createdAt,
        processedAt: a.createdAt,
        summary: meta.summary || meta.message || `Evento ${a.action} despachado`,
        payloadSummary: meta,
      };
    });

    let combined = [...inboundFormatted, ...outboundFormatted];
    if (options?.direction === 'INBOUND') {
      combined = inboundFormatted;
    } else if (options?.direction === 'OUTBOUND') {
      combined = outboundFormatted;
    }

    combined.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

    return {
      stats: {
        totalEvents: combined.length,
        inboundCount: inboundFormatted.length,
        outboundCount: outboundFormatted.length,
        errorCount: combined.filter((e) => e.status === 'ERROR').length,
      },
      events: combined.slice(0, limit),
    };
  }

  async listAuditLogs(
    limit = 100,
    query?: {
      userId?: string;
      action?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const where: any = {};
    if (query?.userId) {
      where.OR = [
        { actorUserId: query.userId },
        { targetUserId: query.userId },
      ];
    }
    if (query?.action) {
      where.action = { contains: query.action, mode: 'insensitive' };
    }
    if (query?.search) {
      const clean = query.search.trim();
      where.OR = [
        { action: { contains: clean, mode: 'insensitive' } },
        { actorUserId: { contains: clean } },
        { targetUserId: { contains: clean } },
      ];
    }
    if (query?.startDate) {
      where.createdAt = { ...(where.createdAt || {}), gte: new Date(query.startDate) };
    }
    if (query?.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { ...(where.createdAt || {}), lte: end };
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      take: Math.min(Number(limit) || 100, 200),
      orderBy: { createdAt: 'desc' },
    });

    // Enriquecer com nomes dos usuários atores
    const actorUserIds = Array.from(new Set(logs.map((l) => l.actorUserId).filter(Boolean))) as string[];
    const targetUserIds = Array.from(new Set(logs.map((l) => l.targetUserId).filter(Boolean))) as string[];
    const allUserIds = Array.from(new Set([...actorUserIds, ...targetUserIds]));

    const users = await this.prisma.user.findMany({
      where: { id: { in: allUserIds } },
      select: { id: true, name: true, role: true, cpf: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return logs.map((log) => {
      const actor = log.actorUserId ? userMap.get(log.actorUserId) : null;
      const target = log.targetUserId ? userMap.get(log.targetUserId) : null;

      // Sanitizar metadata para nunca vazar senhas/tokens/hashes
      const sanitizedMetadata = log.metadata ? { ...(log.metadata as any) } : {};
      delete sanitizedMetadata.password;
      delete sanitizedMetadata.passwordHash;
      delete sanitizedMetadata.token;
      delete sanitizedMetadata.refreshToken;
      delete sanitizedMetadata.secret;
      delete sanitizedMetadata.apiKey;

      return {
        id: log.id,
        action: log.action,
        createdAt: log.createdAt,
        actor: actor
          ? {
              id: actor.id,
              name: actor.name,
              role: actor.role,
              cpf: actor.cpf,
            }
          : {
              id: log.actorUserId || 'SYSTEM',
              name: log.actorUserId ? 'Usuário do Sistema' : 'SISTEMA AUTOMÁTICO',
              role: 'SYSTEM',
              cpf: '',
            },
        target: target
          ? {
              id: target.id,
              name: target.name,
              role: target.role,
            }
          : log.targetUserId
          ? { id: log.targetUserId, name: 'ID ' + log.targetUserId, role: 'N/A' }
          : null,
        metadata: sanitizedMetadata,
      };
    });
  }

  async getSystemConfig() {
    let dbStatus = 'CONNECTED';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'DISCONNECTED';
    }

    const uptimeSeconds = Math.round(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    return {
      environment: process.env.NODE_ENV || 'production',
      backendVersion: '1.0.0',
      backendFramework: 'NestJS 10.x / Node.js ' + process.version,
      androidVersion: '1.0.0 (Build 1, Target SDK 34 / Android 14)',
      database: {
        engine: 'PostgreSQL 16 (Relacional)',
        orm: 'Prisma ORM 5.x',
        status: dbStatus,
      },
      security: {
        passwordHashing: 'Argon2id (RFC 9106 Memory-Hard)',
        tokenStrategy: 'Dual JWT RS256/HS256 + Refresh Token Rotation',
        erpWebhookSecurity: 'HMAC-SHA256 Signature (x-hk-signature) + Nonce Timestamp',
        idempotencyStore: 'PostgreSQL Idempotency Records with Key Index',
        rbac: 'Hierarchical Role-Based Access Control (ADMIN, MANAGER, OPERATOR, DRIVER)',
      },
      integrations: {
        erpWebhookInbound: '/api/v1/integrations/erp/*',
        geocodingEngine: 'HK Route Engine (Active)',
        telemetryFrequency: '15-min Interval SLA',
      },
      health: {
        status: dbStatus === 'CONNECTED' ? 'HEALTHY' : 'DEGRADED',
        uptime: `${hours}h ${minutes}m (${uptimeSeconds}s)`,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
