import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ErpIntegrationService } from '../common/services/erp-integration.service';
import { ScanInvoiceDto } from './dto/scan-invoice.dto';
import { DeliveryStatus, InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly erpService: ErpIntegrationService,
  ) {}

  async scanAndAttach(dto: ScanInvoiceDto, driverId: string) {
    const { accessKey, tripId } = dto;
    const cleanKey = accessKey.trim();

    if (!/^\d{44}$/.test(cleanKey)) {
      throw new BadRequestException(
        'Chave de acesso da NF-e inválida. Deve conter exatamente 44 dígitos numéricos.',
      );
    }

    if (!tripId) {
      throw new BadRequestException('tripId é obrigatório para vincular a NF-e.');
    }

    // 1. Check trip security - driver must own this trip
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        driver: true,
        deliveries: { include: { invoices: true } },
        invoices: true,
      },
    });

    if (!trip) {
      throw new NotFoundException(`Viagem com ID ${tripId} não foi encontrada.`);
    }

    if (trip.driverId !== driverId) {
      throw new ForbiddenException(
        'Acesso negado: Você não é o motorista responsável por esta viagem.',
      );
    }

    // 2. Check duplicate scanning
    const existingInvoiceInDb = await this.prisma.invoice.findUnique({
      where: { accessKey: cleanKey },
      include: { trip: true },
    });

    if (existingInvoiceInDb) {
      if (existingInvoiceInDb.tripId === tripId) {
        throw new BadRequestException('NF-e já adicionada à carga.');
      } else if (existingInvoiceInDb.tripId && existingInvoiceInDb.trip && existingInvoiceInDb.trip.status !== 'CANCELLED') {
        throw new BadRequestException(
          `NF-e pertence à viagem "${existingInvoiceInDb.trip.tripCode}" e não pode ser vinculada a esta carga.`,
        );
      }
    }

    // 3. Fetch from ERP Integration layer
    const erpInvoice = await this.erpService.fetchInvoiceByAccessKey(
      cleanKey,
      tripId,
    );

    // 4. Customer Grouping: Find or create Delivery for recipient/customer on this trip
    let delivery = trip.deliveries.find(
      (d) =>
        (d.customerId && erpInvoice.customerId && d.customerId === erpInvoice.customerId) ||
        (d.recipient.toLowerCase().trim() === erpInvoice.recipient.toLowerCase().trim() &&
          d.address.toLowerCase().trim() === erpInvoice.address.toLowerCase().trim()),
    );

    if (delivery) {
      // Update existing delivery with aggregated volumes, weight, and value
      const updatedVolume = delivery.volumeCount + erpInvoice.volumeCount;
      const updatedWeight = delivery.weight + erpInvoice.weight;
      const updatedValue = delivery.value + erpInvoice.value;

      delivery = await this.prisma.delivery.update({
        where: { id: delivery.id },
        data: {
          volumeCount: updatedVolume,
          weight: updatedWeight,
          value: updatedValue,
          quantityExpected: (delivery.quantityExpected || 0) + erpInvoice.volumeCount,
          deliveryWindowStart: erpInvoice.deliveryWindowStart || delivery.deliveryWindowStart,
          deliveryWindowEnd: erpInvoice.deliveryWindowEnd || delivery.deliveryWindowEnd,
          lunchBreakStart: erpInvoice.lunchBreakStart || delivery.lunchBreakStart,
          lunchBreakEnd: erpInvoice.lunchBreakEnd || delivery.lunchBreakEnd,
        },
        include: { invoices: true },
      });
    } else {
      // Create a new delivery for this customer on the trip
      const nextSeq = trip.deliveries.length + 1;
      delivery = await this.prisma.delivery.create({
        data: {
          tripId,
          recipient: erpInvoice.recipient,
          recipientDocument: erpInvoice.recipientDocument,
          address: erpInvoice.address,
          numberAddress: erpInvoice.numberAddress,
          complement: erpInvoice.complement,
          neighborhood: erpInvoice.neighborhood,
          city: erpInvoice.city,
          state: erpInvoice.state,
          postalCode: erpInvoice.postalCode,
          latitude: erpInvoice.latitude,
          longitude: erpInvoice.longitude,
          customerId: erpInvoice.customerId,
          customerName: erpInvoice.customerName || erpInvoice.recipient,
          sequence: nextSeq,
          status: DeliveryStatus.PENDING,
          volumeCount: erpInvoice.volumeCount,
          weight: erpInvoice.weight,
          value: erpInvoice.value,
          quantityExpected: erpInvoice.volumeCount,
          deliveryWindowStart: erpInvoice.deliveryWindowStart || '08:00',
          deliveryWindowEnd: erpInvoice.deliveryWindowEnd || '18:00',
          lunchBreakStart: erpInvoice.lunchBreakStart,
          lunchBreakEnd: erpInvoice.lunchBreakEnd,
          observations: erpInvoice.observations,
        },
        include: { invoices: true },
      });
    }

    // 5. Create or update invoice record in DB attached to trip and delivery
    let createdInvoice;
    if (existingInvoiceInDb) {
      createdInvoice = await this.prisma.invoice.update({
        where: { id: existingInvoiceInDb.id },
        data: {
          tripId,
          deliveryId: delivery.id,
          status: InvoiceStatus.IN_TRANSIT,
        },
      });
    } else {
      createdInvoice = await this.prisma.invoice.create({
        data: {
          accessKey: cleanKey,
          number: erpInvoice.number,
          externalId: erpInvoice.externalId,
          tripId,
          deliveryId: delivery.id,
          recipient: erpInvoice.recipient,
          recipientDocument: erpInvoice.recipientDocument,
          address: erpInvoice.address,
          numberAddress: erpInvoice.numberAddress,
          complement: erpInvoice.complement,
          neighborhood: erpInvoice.neighborhood,
          city: erpInvoice.city,
          state: erpInvoice.state,
          postalCode: erpInvoice.postalCode,
          latitude: erpInvoice.latitude,
          longitude: erpInvoice.longitude,
          customerId: erpInvoice.customerId,
          customerName: erpInvoice.customerName,
          value: erpInvoice.value,
          weight: erpInvoice.weight,
          volumeCount: erpInvoice.volumeCount,
          deliveryWindowStart: erpInvoice.deliveryWindowStart,
          deliveryWindowEnd: erpInvoice.deliveryWindowEnd,
          lunchBreakStart: erpInvoice.lunchBreakStart,
          lunchBreakEnd: erpInvoice.lunchBreakEnd,
          observations: erpInvoice.observations,
          status: InvoiceStatus.IN_TRANSIT,
        },
      });
    }

    return {
      message: 'NF-e bipada e vinculada à carga com sucesso.',
      invoice: createdInvoice,
      delivery,
      erpConnected: erpInvoice.erpConnected,
      erpStatus: erpInvoice.erpStatus,
    };
  }

  async getByAccessKey(accessKey: string, driverId: string) {
    const cleanKey = accessKey.trim();
    const invoice = await this.prisma.invoice.findUnique({
      where: { accessKey: cleanKey },
      include: { trip: true, delivery: true },
    });

    if (!invoice) {
      throw new NotFoundException('NF-e não encontrada no sistema.');
    }

    if (invoice.trip && invoice.trip.driverId && driverId && invoice.trip.driverId !== driverId) {
      throw new ForbiddenException(
        'Acesso negado: Você não possui autorização para visualizar esta NF-e.',
      );
    }

    return invoice;
  }
}
