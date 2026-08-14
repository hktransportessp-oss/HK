import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { DeliveryStatus } from '@prisma/client';

@Injectable()
export class OccurrencesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOccurrenceDto, driverId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: dto.tripId },
    });

    if (!trip) {
      throw new NotFoundException(`Viagem com ID ${dto.tripId} não encontrada`);
    }

    if (driverId && trip.driverId !== driverId) {
      throw new ForbiddenException('Acesso não autorizado para esta viagem');
    }

    // Verify delivery if provided
    if (dto.deliveryId) {
      const delivery = await this.prisma.delivery.findUnique({
        where: { id: dto.deliveryId },
      });
      if (!delivery || delivery.tripId !== dto.tripId) {
        throw new NotFoundException(`Entrega vinculada não encontrada na viagem`);
      }
      // Update delivery status to OCCURRENCE
      await this.prisma.delivery.update({
        where: { id: dto.deliveryId },
        data: { status: DeliveryStatus.OCCURRENCE },
      });
    }

    const title = dto.title || `Ocorrência: ${dto.type}`;

    const occurrence = await this.prisma.occurrence.create({
      data: {
        tripId: dto.tripId,
        deliveryId: dto.deliveryId || null,
        driverId: driverId || trip.driverId || '',
        title,
        description: dto.description,
        type: dto.type,
        status: 'OPEN',
      },
    });

    return occurrence;
  }

  async findAllForTrip(tripId: string, driverId: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundException(`Viagem não encontrada`);
    }

    if (driverId && trip.driverId !== driverId) {
      throw new ForbiddenException('Acesso não autorizado para esta viagem');
    }

    return this.prisma.occurrence.findMany({
      where: { tripId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
