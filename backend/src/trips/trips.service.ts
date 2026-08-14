import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { TripStatus, DeliveryStatus } from '@prisma/client';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForDriver(driverId: string) {
    return this.prisma.trip.findMany({
      where: driverId ? { driverId } : {},
      include: {
        vehicle: true,
        stops: { orderBy: { stopOrder: 'asc' } },
        deliveries: { include: { invoices: true } },
        romaneios: true,
        tolls: true,
        occurrences: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, driverId?: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        driver: { include: { user: true } },
        vehicle: true,
        stops: { orderBy: { stopOrder: 'asc' } },
        deliveries: {
          include: { invoices: true, occurrences: true },
          orderBy: { sequence: 'asc' },
        },
        invoices: true,
        ctes: true,
        romaneios: { include: { documents: true } },
        tolls: true,
        settlements: true,
        occurrences: true,
      },
    });

    if (!trip) {
      throw new NotFoundException(`Viagem com ID ${id} não encontrada`);
    }

    if (driverId && trip.driverId && trip.driverId !== driverId) {
      throw new ForbiddenException('Acesso não autorizado para esta viagem');
    }

    return trip;
  }

  async acceptTrip(id: string, driverId: string) {
    const trip = await this.findOne(id, driverId);

    // Idempotent return if already accepted or in progress
    if (
      trip.status === TripStatus.ACCEPTED ||
      trip.status === TripStatus.IN_PROGRESS ||
      trip.status === TripStatus.COMPLETED
    ) {
      return trip;
    }

    if (trip.status !== TripStatus.ASSIGNED && trip.status !== TripStatus.PENDING) {
      throw new BadRequestException(
        `Não é possível aceitar uma viagem no estado ${trip.status}`,
      );
    }

    return this.prisma.trip.update({
      where: { id },
      data: {
        status: TripStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: {
        vehicle: true,
        deliveries: true,
      },
    });
  }

  async startTrip(id: string, driverId: string) {
    const trip = await this.findOne(id, driverId);

    // Idempotent return
    if (trip.status === TripStatus.IN_PROGRESS || trip.status === TripStatus.COMPLETED) {
      return trip;
    }

    return this.prisma.trip.update({
      where: { id },
      data: {
        status: TripStatus.IN_PROGRESS,
        startDate: new Date(),
      },
      include: {
        vehicle: true,
        deliveries: true,
      },
    });
  }

  async completeTrip(id: string, driverId: string) {
    const trip = await this.findOne(id, driverId);

    // Idempotent return
    if (trip.status === TripStatus.COMPLETED) {
      return trip;
    }

    // Verify all deliveries are in a terminal state
    const pendingDeliveries = trip.deliveries.filter(
      (del) =>
        del.status === DeliveryStatus.PENDING ||
        del.status === DeliveryStatus.IN_ROUTE ||
        del.status === DeliveryStatus.ARRIVED,
    );

    if (pendingDeliveries.length > 0) {
      throw new BadRequestException(
        `Existem ${pendingDeliveries.length} entrega(s) pendente(s). Conclua todas as entregas antes de finalizar a viagem.`,
      );
    }

    return this.prisma.trip.update({
      where: { id },
      data: {
        status: TripStatus.COMPLETED,
        endDate: new Date(),
      },
      include: {
        vehicle: true,
        deliveries: true,
      },
    });
  }

  async create(dto: CreateTripDto, driverId: string) {
    const existing = await this.prisma.trip.findUnique({
      where: { tripCode: dto.tripCode },
    });

    if (existing) {
      return existing;
    }

    let vehicleId: string | undefined;
    if (driverId) {
      const assignment = await this.prisma.driverVehicleAssignment.findFirst({
        where: { driverId, isCurrent: true },
      });
      vehicleId = assignment?.vehicleId;
    }

    return this.prisma.trip.create({
      data: {
        tripCode: dto.tripCode,
        origin: dto.origin,
        destination: dto.destination,
        notes: dto.notes,
        driverId: driverId || null,
        vehicleId: vehicleId || null,
        status: TripStatus.ASSIGNED,
      },
    });
  }
}
