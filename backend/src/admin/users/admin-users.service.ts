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
      availableVehicles,
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
      recentRomaneios,
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
      this.prisma.vehicle.count({ where: { status: 'DISPONIVEL' } }),
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
      this.prisma.romaneio.findMany({
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
      availableVehicles,
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
      recentRomaneios,
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

  async getOccurrenceById(id: string) {
    const occurrence = await this.prisma.occurrence.findUnique({
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
        delivery: true,
      },
    });

    if (!occurrence) {
      throw new NotFoundException(`Ocorrência com ID ${id} não encontrada`);
    }

    return occurrence;
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
        deliveries: {
          select: {
            id: true,
            status: true,
            sequence: true,
            recipient: true,
            city: true,
            state: true,
            volumeCount: true,
            weight: true,
          },
          orderBy: { sequence: 'asc' },
        },
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

  async createAdminTrip(dto: any, actor?: { id: string }) {
    // 1. Gera ou valida tripCode
    let tripCode = dto.tripCode?.trim();
    if (!tripCode) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      tripCode = `TRP-${dateStr}-${rand}`;
    }

    const existingTrip = await this.prisma.trip.findUnique({ where: { tripCode } });
    if (existingTrip) {
      throw new ConflictException(`Já existe uma viagem com o código ${tripCode}`);
    }

    // 2. Validação de Motorista e Veículo
    let driverId = dto.driverId || null;
    let vehicleId = dto.vehicleId || null;

    if (driverId) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: driverId },
        include: {
          user: true,
          assignments: { where: { isCurrent: true }, include: { vehicle: true }, take: 1 },
        },
      });
      if (!driver) {
        throw new NotFoundException('Motorista selecionado não foi encontrado.');
      }
      if (driver.status === 'BLOQUEADO' || driver.user?.status === 'BLOCKED' || driver.user?.status === 'INACTIVE') {
        throw new BadRequestException('Motorista selecionado está bloqueado ou inativo.');
      }
      // Se não especificou veículo, tenta obter o veículo ativo do motorista
      if (!vehicleId && driver.assignments && driver.assignments.length > 0) {
        vehicleId = driver.assignments[0].vehicleId;
      }
    }

    if (vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        throw new NotFoundException('Veículo selecionado não foi encontrado.');
      }
      if (vehicle.status === 'INATIVO') {
        throw new BadRequestException('Veículo selecionado está inativo na frota.');
      }
    }

    // 3. Validação de Origem e Paradas
    const origin = dto.origin?.trim();
    if (!origin) {
      throw new BadRequestException('O local de origem da rota é obrigatório.');
    }

    const rawStops = Array.isArray(dto.stops) ? dto.stops : (Array.isArray(dto.deliveries) ? dto.deliveries : []);
    const isAssignAction = dto.action === 'ASSIGN' || dto.status === 'ASSIGNED';

    if (isAssignAction) {
      if (!driverId) {
        throw new BadRequestException('Para despachar a viagem ao motorista, a seleção de um motorista ativo é obrigatória.');
      }
      if (!vehicleId) {
        throw new BadRequestException('Para despachar a viagem ao motorista, a seleção de um veículo é obrigatória.');
      }
      if (rawStops.length === 0) {
        throw new BadRequestException('Para despachar a viagem, adicione pelo menos uma parada / entrega.');
      }
    }

    // Calcula destino a partir das paradas ou fallback
    let destination = dto.destination?.trim();
    if (!destination && rawStops.length > 0) {
      const lastStop = rawStops[rawStops.length - 1];
      destination = `${lastStop.recipient || 'Entrega'} - ${lastStop.city || 'Destino'}/${lastStop.state || 'SP'}`;
    } else if (!destination) {
      destination = 'A DEFINIR';
    }

    const finalStatus: TripStatus = isAssignAction ? TripStatus.ASSIGNED : TripStatus.PENDING;

    // Monta notas operacionais
    let notes = dto.notes?.trim() || '';
    if (dto.scheduledDate || dto.scheduledTime) {
      const sched = `[PROGRAMADA: ${dto.scheduledDate || ''} ${dto.scheduledTime || ''}]`.trim();
      notes = notes ? `${sched} ${notes}` : sched;
    }

    // 4. Executa transação de criação
    const createdTrip = await this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          tripCode,
          origin,
          destination,
          notes: notes || null,
          driverId,
          vehicleId,
          status: finalStatus,
          startDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
        },
      });

      // Criação das paradas e entregas
      for (let i = 0; i < rawStops.length; i++) {
        const stop = rawStops[i];
        const sequence = i + 1;
        const recipient = stop.recipient?.trim() || `Parada #${sequence}`;
        const address = stop.address?.trim() || '';
        const numberAddress = stop.numberAddress?.trim() || null;
        const complement = stop.complement?.trim() || null;
        const neighborhood = stop.neighborhood?.trim() || null;
        const city = stop.city?.trim() || 'São Paulo';
        const state = stop.state?.trim() || 'SP';
        const postalCode = (stop.postalCode || stop.zipCode)?.trim() || null;
        const phone = (stop.recipientPhone || stop.phone)?.trim() || null;
        const fullAddress = [address, numberAddress, neighborhood, city, state].filter(Boolean).join(', ');

        // TripStop
        await tx.tripStop.create({
          data: {
            tripId: trip.id,
            stopOrder: sequence,
            locationName: recipient,
            address: fullAddress || address || 'Endereço não informado',
            status: 'PENDING',
          },
        });

        // Delivery
        const delivery = await tx.delivery.create({
          data: {
            tripId: trip.id,
            recipient,
            recipientDocument: stop.recipientDocument?.trim() || null,
            address: address || 'Endereço não informado',
            numberAddress,
            complement,
            neighborhood,
            city,
            state,
            postalCode,
            sequence,
            status: DeliveryStatus.PENDING,
            volumeCount: Number(stop.volumeCount) > 0 ? Number(stop.volumeCount) : 1,
            weight: Number(stop.weight) >= 0 ? Number(stop.weight) : 0,
            value: Number(stop.invoiceValue) >= 0 ? Number(stop.invoiceValue) : 0,
            quantityExpected: Number(stop.volumeCount) > 0 ? Number(stop.volumeCount) : 1,
            notes: stop.notes?.trim() || null,
            observations: phone ? `Contato: ${phone}` : null,
          },
        });

        // Se informou dados de Nota Fiscal operacional
        if (stop.invoiceNumber?.trim() || stop.invoiceKey?.trim() || stop.invoiceAccessKey?.trim()) {
          const invoiceNum = stop.invoiceNumber?.trim() || `NF-${sequence}`;
          const accessKey = (stop.invoiceAccessKey || stop.invoiceKey)?.trim() || 
            `352608${Math.floor(10000000000000 + Math.random() * 90000000000000)}55001${invoiceNum.replace(/\D/g, '').padStart(9, '0')}`;

          await tx.invoice.create({
            data: {
              number: invoiceNum,
              accessKey,
              tripId: trip.id,
              deliveryId: delivery.id,
              recipient,
              recipientDocument: stop.recipientDocument?.trim() || null,
              address: address || 'Endereço não informado',
              numberAddress,
              complement,
              neighborhood,
              city,
              state,
              postalCode,
              volumeCount: Number(stop.volumeCount) > 0 ? Number(stop.volumeCount) : 1,
              weight: Number(stop.weight) >= 0 ? Number(stop.weight) : 0,
              value: Number(stop.invoiceValue) >= 0 ? Number(stop.invoiceValue) : 0,
              status: InvoiceStatus.PENDING,
            },
          });
        }
      }

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: finalStatus === TripStatus.ASSIGNED ? 'TRIP_ASSIGNED' : 'TRIP_CREATED',
        metadata: {
          tripId: trip.id,
          tripCode: trip.tripCode,
          driverId,
          vehicleId,
          stopsCount: rawStops.length,
          status: finalStatus,
        },
        prismaClient: tx,
      });

      return trip;
    });

    return this.getAdminTripById(createdTrip.id);
  }

  async updateAdminTrip(id: string, dto: any, actor?: { id: string }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { driver: true, vehicle: true },
    });
    if (!trip) {
      throw new NotFoundException(`Viagem com ID ${id} não encontrada`);
    }

    if (trip.status === TripStatus.IN_PROGRESS || trip.status === TripStatus.COMPLETED) {
      throw new BadRequestException('Não é permitido alterar a estrutura de uma rota em andamento ou concluída.');
    }

    let driverId = dto.driverId !== undefined ? (dto.driverId || null) : trip.driverId;
    let vehicleId = dto.vehicleId !== undefined ? (dto.vehicleId || null) : trip.vehicleId;

    if (driverId) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: driverId },
        include: { user: true, assignments: { where: { isCurrent: true } } },
      });
      if (!driver) throw new NotFoundException('Motorista não encontrado');
      if (driver.status === 'BLOQUEADO' || driver.user?.status === 'BLOCKED' || driver.user?.status === 'INACTIVE') {
        throw new BadRequestException('Motorista selecionado está inativo ou bloqueado.');
      }
      if (!vehicleId && driver.assignments && driver.assignments.length > 0) {
        vehicleId = driver.assignments[0].vehicleId;
      }
    }

    if (vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) throw new NotFoundException('Veículo não encontrado');
      if (vehicle.status === 'INATIVO') throw new BadRequestException('Veículo está inativo na frota.');
    }

    const origin = dto.origin !== undefined ? dto.origin.trim() : trip.origin;
    let destination = dto.destination !== undefined ? dto.destination.trim() : trip.destination;

    const rawStops = Array.isArray(dto.stops) ? dto.stops : (Array.isArray(dto.deliveries) ? dto.deliveries : null);
    if (rawStops && rawStops.length > 0 && (!dto.destination || !dto.destination.trim())) {
      const lastStop = rawStops[rawStops.length - 1];
      destination = `${lastStop.recipient || 'Entrega'} - ${lastStop.city || 'Destino'}/${lastStop.state || 'SP'}`;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id },
        data: {
          origin,
          destination,
          notes: dto.notes !== undefined ? (dto.notes?.trim() || null) : trip.notes,
          driverId,
          vehicleId,
          startDate: dto.scheduledDate ? new Date(dto.scheduledDate) : trip.startDate,
        },
      });

      // Se passou array de paradas, atualiza toda a cadeia de paradas/entregas
      if (rawStops) {
        await tx.invoice.deleteMany({ where: { tripId: id } });
        await tx.delivery.deleteMany({ where: { tripId: id } });
        await tx.tripStop.deleteMany({ where: { tripId: id } });

        for (let i = 0; i < rawStops.length; i++) {
          const stop = rawStops[i];
          const sequence = i + 1;
          const recipient = stop.recipient?.trim() || `Parada #${sequence}`;
          const address = stop.address?.trim() || '';
          const numberAddress = stop.numberAddress?.trim() || null;
          const complement = stop.complement?.trim() || null;
          const neighborhood = stop.neighborhood?.trim() || null;
          const city = stop.city?.trim() || 'São Paulo';
          const state = stop.state?.trim() || 'SP';
          const postalCode = (stop.postalCode || stop.zipCode)?.trim() || null;
          const phone = (stop.recipientPhone || stop.phone)?.trim() || null;
          const fullAddress = [address, numberAddress, neighborhood, city, state].filter(Boolean).join(', ');

          await tx.tripStop.create({
            data: {
              tripId: id,
              stopOrder: sequence,
              locationName: recipient,
              address: fullAddress || address || 'Endereço não informado',
              status: 'PENDING',
            },
          });

          const delivery = await tx.delivery.create({
            data: {
              tripId: id,
              recipient,
              recipientDocument: stop.recipientDocument?.trim() || null,
              address: address || 'Endereço não informado',
              numberAddress,
              complement,
              neighborhood,
              city,
              state,
              postalCode,
              sequence,
              status: DeliveryStatus.PENDING,
              volumeCount: Number(stop.volumeCount) > 0 ? Number(stop.volumeCount) : 1,
              weight: Number(stop.weight) >= 0 ? Number(stop.weight) : 0,
              value: Number(stop.invoiceValue) >= 0 ? Number(stop.invoiceValue) : 0,
              quantityExpected: Number(stop.volumeCount) > 0 ? Number(stop.volumeCount) : 1,
              notes: stop.notes?.trim() || null,
              observations: phone ? `Contato: ${phone}` : null,
            },
          });

          if (stop.invoiceNumber?.trim() || stop.invoiceKey?.trim() || stop.invoiceAccessKey?.trim()) {
            const invoiceNum = stop.invoiceNumber?.trim() || `NF-${sequence}`;
            const accessKey = (stop.invoiceAccessKey || stop.invoiceKey)?.trim() || 
              `352608${Math.floor(10000000000000 + Math.random() * 90000000000000)}55001${invoiceNum.replace(/\D/g, '').padStart(9, '0')}`;

            await tx.invoice.create({
              data: {
                number: invoiceNum,
                accessKey,
                tripId: id,
                deliveryId: delivery.id,
                recipient,
                recipientDocument: stop.recipientDocument?.trim() || null,
                address: address || 'Endereço não informado',
                numberAddress,
                complement,
                neighborhood,
                city,
                state,
                postalCode,
                volumeCount: Number(stop.volumeCount) > 0 ? Number(stop.volumeCount) : 1,
                weight: Number(stop.weight) >= 0 ? Number(stop.weight) : 0,
                value: Number(stop.invoiceValue) >= 0 ? Number(stop.invoiceValue) : 0,
                status: InvoiceStatus.PENDING,
              },
            });
          }
        }
      }

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'TRIP_UPDATED',
        metadata: { tripId: id, tripCode: trip.tripCode },
        prismaClient: tx,
      });
    });

    return this.getAdminTripById(id);
  }

  async assignAdminTrip(
    id: string,
    dto: { driverId: string; vehicleId?: string; notes?: string },
    actor?: { id: string },
  ) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { deliveries: true },
    });
    if (!trip) throw new NotFoundException(`Viagem com ID ${id} não encontrada`);

    if (trip.status === TripStatus.IN_PROGRESS || trip.status === TripStatus.COMPLETED) {
      throw new BadRequestException('Viagem já iniciada ou concluída não pode ser reatribuída por este fluxo.');
    }
    if (trip.status === TripStatus.CANCELLED) {
      throw new BadRequestException('Viagem cancelada não pode ser atribuída.');
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: dto.driverId },
      include: {
        user: true,
        assignments: { where: { isCurrent: true }, include: { vehicle: true }, take: 1 },
      },
    });
    if (!driver) throw new NotFoundException('Motorista selecionado não encontrado');
    if (driver.status === 'BLOQUEADO' || driver.user?.status === 'BLOCKED' || driver.user?.status === 'INACTIVE') {
      throw new BadRequestException('Motorista selecionado está inativo ou bloqueado.');
    }

    let vehicleId = dto.vehicleId;
    if (!vehicleId && driver.assignments && driver.assignments.length > 0) {
      vehicleId = driver.assignments[0].vehicleId;
    }
    if (!vehicleId) {
      throw new BadRequestException('Nenhum veículo vinculado ao motorista. Selecione um veículo para a viagem.');
    }

    if (trip.deliveries.length === 0) {
      throw new BadRequestException('A rota precisa ter pelo menos 1 parada / entrega cadastrada antes de ser despachada.');
    }

    const updated = await this.prisma.trip.update({
      where: { id },
      data: {
        driverId: dto.driverId,
        vehicleId,
        status: TripStatus.ASSIGNED,
        notes: dto.notes ? (trip.notes ? `${trip.notes}\n[ATRIBUIÇÃO]: ${dto.notes}` : `[ATRIBUIÇÃO]: ${dto.notes}`) : trip.notes,
      },
      include: {
        driver: { include: { user: true } },
        vehicle: true,
      },
    });

    await this.auditService.log({
      actorUserId: actor?.id || null,
      action: 'TRIP_ASSIGNED',
      metadata: { tripId: id, tripCode: trip.tripCode, driverId: dto.driverId, vehicleId },
    });

    return updated;
  }

  async unassignAdminTrip(id: string, dto: { reason: string }, actor?: { id: string }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { driver: { include: { user: true } } },
    });
    if (!trip) throw new NotFoundException(`Viagem com ID ${id} não encontrada`);

    if (trip.status === TripStatus.IN_PROGRESS || trip.status === TripStatus.COMPLETED) {
      throw new BadRequestException('Não é possível retirar a atribuição de uma rota já iniciada ou concluída.');
    }
    if (trip.status === TripStatus.CANCELLED) {
      throw new BadRequestException('Viagem cancelada.');
    }

    const reason = dto.reason?.trim() || 'Desatribuição operacional solicitada pelo operador';
    const timestamp = new Date().toLocaleString('pt-BR');
    const noteEntry = `\n[DESATRIBUIÇÃO em ${timestamp}]: Motorista ${trip.driver?.user?.name || 'Anterior'} removido. Motivo: ${reason}`;

    const updated = await this.prisma.trip.update({
      where: { id },
      data: {
        driverId: null,
        vehicleId: null,
        status: TripStatus.PENDING,
        notes: trip.notes ? `${trip.notes}${noteEntry}` : noteEntry,
      },
      include: { vehicle: true },
    });

    await this.auditService.log({
      actorUserId: actor?.id || null,
      action: 'TRIP_UNASSIGNED',
      metadata: { tripId: id, tripCode: trip.tripCode, previousDriverId: trip.driverId, reason },
    });

    return updated;
  }

  async reassignAdminTrip(
    id: string,
    dto: { newDriverId?: string; driverId?: string; newVehicleId?: string; vehicleId?: string; reason?: string },
    actor?: { id: string },
  ) {
    const targetDriverId = dto.newDriverId || dto.driverId;
    const targetVehicleId = dto.newVehicleId || dto.vehicleId;

    if (!targetDriverId) {
      throw new BadRequestException('ID do novo motorista é obrigatório.');
    }

    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { driver: { include: { user: true } } },
    });
    if (!trip) throw new NotFoundException(`Viagem com ID ${id} não encontrada`);

    if (trip.status === TripStatus.IN_PROGRESS || trip.status === TripStatus.COMPLETED) {
      throw new BadRequestException('Não é possível trocar o motorista de uma rota em andamento ou concluída.');
    }

    const newDriver = await this.prisma.driver.findUnique({
      where: { id: targetDriverId },
      include: {
        user: true,
        assignments: { where: { isCurrent: true }, include: { vehicle: true }, take: 1 },
      },
    });
    if (!newDriver) throw new NotFoundException('Novo motorista não encontrado');
    if (newDriver.status === 'BLOQUEADO' || newDriver.user?.status === 'BLOCKED' || newDriver.user?.status === 'INACTIVE') {
      throw new BadRequestException('O novo motorista selecionado está bloqueado ou inativo.');
    }

    let vehicleId = targetVehicleId;
    if (!vehicleId && newDriver.assignments && newDriver.assignments.length > 0) {
      vehicleId = newDriver.assignments[0].vehicleId;
    }
    if (!vehicleId && trip.vehicleId) {
      vehicleId = trip.vehicleId;
    }
    if (!vehicleId) {
      throw new BadRequestException('Selecione um veículo para vincular à rota com o novo motorista.');
    }

    const timestamp = new Date().toLocaleString('pt-BR');
    const oldName = trip.driver?.user?.name || 'Anterior';
    const newName = newDriver.user?.name || 'Novo Motorista';
    const reason = dto.reason?.trim() || 'Reatribuição operacional';
    const noteEntry = `\n[TROCA DE MOTORISTA em ${timestamp}]: De "${oldName}" para "${newName}". Motivo: ${reason}`;

    const updated = await this.prisma.trip.update({
      where: { id },
      data: {
        driverId: targetDriverId,
        vehicleId,
        status: TripStatus.ASSIGNED,
        notes: trip.notes ? `${trip.notes}${noteEntry}` : noteEntry,
      },
      include: {
        driver: { include: { user: true } },
        vehicle: true,
      },
    });

    await this.auditService.log({
      actorUserId: actor?.id || null,
      action: 'TRIP_REASSIGNED',
      metadata: {
        tripId: id,
        tripCode: trip.tripCode,
        oldDriverId: trip.driverId,
        newDriverId: targetDriverId,
        vehicleId,
        reason,
      },
    });

    return updated;
  }

  async cancelAdminTrip(id: string, dto: { reason: string }, actor?: { id: string }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { driver: { include: { user: true } } },
    });
    if (!trip) throw new NotFoundException(`Viagem com ID ${id} não encontrada`);

    if (trip.status === TripStatus.COMPLETED) {
      throw new BadRequestException('Viagem já concluída não pode ser cancelada.');
    }
    if (trip.status === TripStatus.CANCELLED) {
      return trip;
    }

    const reason = dto.reason?.trim();
    if (!reason) {
      throw new BadRequestException('O motivo do cancelamento é obrigatório.');
    }

    const timestamp = new Date().toLocaleString('pt-BR');
    const noteEntry = `\n[CANCELAMENTO em ${timestamp}]: Motivo: ${reason}`;

    const updated = await this.prisma.trip.update({
      where: { id },
      data: {
        status: TripStatus.CANCELLED,
        notes: trip.notes ? `${trip.notes}${noteEntry}` : noteEntry,
      },
      include: {
        driver: { include: { user: true } },
        vehicle: true,
      },
    });

    await this.auditService.log({
      actorUserId: actor?.id || null,
      action: 'TRIP_CANCELLED',
      metadata: { tripId: id, tripCode: trip.tripCode, reason },
    });

    return updated;
  }

  async deleteAdminTrip(id: string, actor?: { id: string }) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        _count: {
          select: { romaneios: true, tolls: true, occurrences: true },
        },
      },
    });
    if (!trip) throw new NotFoundException(`Viagem com ID ${id} não encontrada`);

    if (trip.status !== TripStatus.PENDING && trip.status !== TripStatus.CANCELLED) {
      throw new BadRequestException('Apenas viagens em rascunho (PENDING) ou canceladas sem execuções podem ser excluídas.');
    }
    if (trip._count.romaneios > 0 || trip._count.tolls > 0 || trip._count.occurrences > 0) {
      throw new BadRequestException('Esta viagem possui registros operacionais vinculados e não pode ser excluída.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.invoice.deleteMany({ where: { tripId: id } });
      await tx.delivery.deleteMany({ where: { tripId: id } });
      await tx.tripStop.deleteMany({ where: { tripId: id } });
      await tx.trip.delete({ where: { id } });

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'TRIP_DELETED',
        metadata: { tripId: id, tripCode: trip.tripCode },
        prismaClient: tx,
      });
    });

    return { success: true, message: 'Viagem em rascunho excluída com sucesso.' };
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
      const allowedPrevious: TripStatus[] = [TripStatus.ASSIGNED, TripStatus.PENDING, TripStatus.ACCEPTED];
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
