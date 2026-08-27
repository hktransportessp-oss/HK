import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AdminVehiclesService {
  private readonly logger = new Logger(AdminVehiclesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private cleanPlate(plate: string): string {
    return plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  async listVehicles(query?: { search?: string; status?: string }) {
    const where: any = {};

    if (query?.status) {
      where.status = query.status;
    }

    if (query?.search) {
      const clean = this.cleanPlate(query.search);
      where.OR = [
        { plate: { contains: query.search.trim().toUpperCase() } },
        { model: { contains: query.search.trim(), mode: 'insensitive' } },
        { brand: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
      if (clean) {
        where.OR.push({ plate: { contains: clean } });
      }
    }

    return this.prisma.vehicle.findMany({
      where,
      orderBy: { plate: 'asc' },
      include: {
        assignments: {
          where: { isCurrent: true },
          include: {
            driver: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    cpf: true,
                    phone: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
      },
    });
  }

  async getVehicleById(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        assignments: {
          orderBy: { createdAt: 'desc' },
          include: {
            driver: {
              include: {
                user: {
                  select: { id: true, name: true, phone: true, cpf: true },
                },
              },
            },
          },
        },
        trips: {
          take: 15,
          orderBy: { createdAt: 'desc' },
          include: {
            driver: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
    }

    return vehicle;
  }

  async createVehicle(dto: CreateVehicleDto, actor?: { id: string; role: Role }) {
    const formattedPlate = dto.plate.trim().toUpperCase();

    const existing = await this.prisma.vehicle.findUnique({
      where: { plate: formattedPlate },
    });

    if (existing) {
      throw new ConflictException(`Veículo com placa ${formattedPlate} já está cadastrado`);
    }

    return this.prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.create({
        data: {
          plate: formattedPlate,
          model: dto.model.trim(),
          brand: dto.brand.trim(),
          year: dto.year || null,
          status: dto.status || 'DISPONIVEL',
        },
      });

      if (dto.driverId) {
        const driver = await tx.driver.findUnique({ where: { id: dto.driverId } });
        if (driver) {
          await tx.driverVehicleAssignment.updateMany({
            where: { vehicleId: vehicle.id, isCurrent: true },
            data: { isCurrent: false, endAt: new Date() },
          });
          await tx.driverVehicleAssignment.create({
            data: {
              driverId: dto.driverId,
              vehicleId: vehicle.id,
              isCurrent: true,
              startAt: new Date(),
            },
          });
        }
      }

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'VEHICLE_CREATED',
        targetUserId: null,
        metadata: { plate: vehicle.plate, model: vehicle.model },
        prismaClient: tx,
      });

      return vehicle;
    });
  }

  async updateVehicle(
    id: string,
    dto: UpdateVehicleDto,
    actor?: { id: string; role: Role },
  ) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.vehicle.update({
        where: { id },
        data: {
          model: dto.model !== undefined ? dto.model.trim() : undefined,
          brand: dto.brand !== undefined ? dto.brand.trim() : undefined,
          year: dto.year !== undefined ? dto.year : undefined,
          status: dto.status !== undefined ? dto.status : undefined,
        },
      });

      if (dto.driverId !== undefined) {
        await tx.driverVehicleAssignment.updateMany({
          where: { vehicleId: id, isCurrent: true },
          data: { isCurrent: false, endAt: new Date() },
        });

        if (dto.driverId) {
          await tx.driverVehicleAssignment.create({
            data: {
              driverId: dto.driverId,
              vehicleId: id,
              isCurrent: true,
              startAt: new Date(),
            },
          });
        }
      }

      await this.auditService.log({
        actorUserId: actor?.id || null,
        action: 'VEHICLE_UPDATED',
        targetUserId: null,
        metadata: { vehicleId: id, updates: dto },
        prismaClient: tx,
      });

      return updated;
    });
  }
}
