import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompleteDeliveryDto } from './dto/complete-delivery.dto';
import { DeliveryStatus, InvoiceStatus } from '@prisma/client';

@Injectable()
export class DeliveriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string, driverId?: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: {
        trip: true,
        invoices: true,
        occurrences: true,
      },
    });

    if (!delivery) {
      throw new NotFoundException(`Entrega com ID ${id} não encontrada`);
    }

    if (driverId && delivery.trip.driverId !== driverId) {
      throw new ForbiddenException('Acesso não autorizado para esta entrega');
    }

    return delivery;
  }

  async arrive(id: string, driverId: string) {
    const delivery = await this.findOne(id, driverId);

    // Idempotency check: if already arrived or beyond
    if (
      delivery.status === DeliveryStatus.ARRIVED ||
      delivery.status === DeliveryStatus.DELIVERED ||
      delivery.status === DeliveryStatus.PARTIAL ||
      delivery.status === DeliveryStatus.REFUSED
    ) {
      return delivery;
    }

    return this.prisma.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.ARRIVED,
        arrivedAt: new Date(),
      },
      include: {
        invoices: true,
      },
    });
  }

  async complete(id: string, dto: CompleteDeliveryDto, driverId: string) {
    const delivery = await this.findOne(id, driverId);

    // Verify trip is IN_PROGRESS or ARRIVED
    if (delivery.trip.status !== 'IN_PROGRESS' && delivery.trip.status !== 'ARRIVED') {
      throw new BadRequestException(
        'A viagem precisa estar em andamento para concluir entregas',
      );
    }

    // Idempotency check
    if (
      delivery.status === dto.status &&
      (delivery.status === DeliveryStatus.DELIVERED ||
        delivery.status === DeliveryStatus.PARTIAL ||
        delivery.status === DeliveryStatus.REFUSED)
    ) {
      return delivery;
    }

    if (dto.status === DeliveryStatus.REFUSED && !dto.refusalReason && !dto.notes) {
      throw new BadRequestException(
        'Informe o motivo para recusa da entrega',
      );
    }

    const updatedDelivery = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: dto.status,
        deliveredAt: new Date(),
        notes: dto.notes,
        refusalReason: dto.refusalReason,
        quantityExpected: dto.quantityExpected,
        quantityDelivered: dto.quantityDelivered,
        quantityMissing: dto.quantityMissing,
      },
      include: {
        invoices: true,
      },
    });

    // Update invoices
    const targetInvoiceStatus =
      dto.status === DeliveryStatus.DELIVERED
        ? InvoiceStatus.DELIVERED
        : dto.status === DeliveryStatus.REFUSED
        ? InvoiceStatus.RETURNED
        : InvoiceStatus.DELIVERED;

    await this.prisma.invoice.updateMany({
      where: { deliveryId: id },
      data: { status: targetInvoiceStatus },
    });

    return updatedDelivery;
  }

  async uploadPod(
    id: string,
    podUrl: string,
    podFileHash: string | undefined,
    driverId: string,
  ) {
    const delivery = await this.findOne(id, driverId);

    return this.prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        podUrl,
        podUploadedAt: new Date(),
        podFileHash: podFileHash || `hash-${Date.now()}`,
      },
      include: { invoices: true },
    });
  }
}
