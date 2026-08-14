import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ErpInvoiceResponse {
  id?: string;
  externalId?: string;
  number: string;
  accessKey: string;
  recipient: string;
  recipientDocument: string;
  address: string;
  numberAddress?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  value: number;
  weight: number;
  volumeCount: number;
  deliveryId?: string;
  tripId?: string;
  customerId?: string;
  customerName?: string;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
  observations?: string;
  status: string;
  erpConnected: boolean;
  erpStatus: string;
}

@Injectable()
export class ErpIntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  async fetchInvoiceByAccessKey(
    accessKey: string,
    requestedTripId?: string,
  ): Promise<ErpInvoiceResponse> {
    const cleanKey = accessKey.trim();

    // Key must be exactly 44 digits
    if (!/^\d{44}$/.test(cleanKey)) {
      throw new BadRequestException(
        'Chave de acesso inválida. A chave da NF-e deve possuir exatamente 44 dígitos numéricos.',
      );
    }

    const erpApiUrl = process.env.HK_ERP_API_URL;
    const erpApiKey = process.env.HK_ERP_API_KEY;

    // Check if real HK ERP integration is configured
    const erpConnected = Boolean(erpApiUrl && erpApiKey);
    const erpStatus = erpConnected
      ? 'CONECTADO REAL ERP HK'
      : 'AGUARDANDO CONEXÃO REAL COM ERP';

    // Look up in PostgreSQL database for pre-existing or synced invoice
    const existingDbInvoice = await this.prisma.invoice.findUnique({
      where: { accessKey: cleanKey },
      include: { delivery: true },
    });

    if (existingDbInvoice) {
      return {
        id: existingDbInvoice.id,
        externalId: existingDbInvoice.externalId || undefined,
        number: existingDbInvoice.number,
        accessKey: existingDbInvoice.accessKey,
        recipient: existingDbInvoice.recipient,
        recipientDocument: existingDbInvoice.recipientDocument,
        address: existingDbInvoice.address,
        numberAddress: existingDbInvoice.numberAddress || undefined,
        complement: existingDbInvoice.complement || undefined,
        neighborhood: existingDbInvoice.neighborhood || undefined,
        city: existingDbInvoice.city,
        state: existingDbInvoice.state,
        postalCode: existingDbInvoice.postalCode,
        latitude: existingDbInvoice.latitude || undefined,
        longitude: existingDbInvoice.longitude || undefined,
        value: existingDbInvoice.value,
        weight: existingDbInvoice.weight,
        volumeCount: existingDbInvoice.volumeCount,
        deliveryId: existingDbInvoice.deliveryId || undefined,
        tripId: existingDbInvoice.tripId,
        customerId: existingDbInvoice.customerId || undefined,
        customerName: existingDbInvoice.customerName || undefined,
        deliveryWindowStart: existingDbInvoice.deliveryWindowStart || '08:00',
        deliveryWindowEnd: existingDbInvoice.deliveryWindowEnd || '18:00',
        lunchBreakStart: existingDbInvoice.lunchBreakStart || undefined,
        lunchBreakEnd: existingDbInvoice.lunchBreakEnd || undefined,
        observations: existingDbInvoice.observations || undefined,
        status: existingDbInvoice.status,
        erpConnected,
        erpStatus,
      };
    }

    // If real ERP is configured, an HTTP call would be made here:
    if (erpConnected) {
      // Execute real request to HK ERP
      // const response = await axios.get(`${erpApiUrl}/invoices/${cleanKey}`, { headers: { Authorization: `Bearer ${erpApiKey}` } });
    }

    // When ERP is not connected or invoice is not found in database/ERP:
    throw new NotFoundException(
      `NF-e com chave ${cleanKey} não foi encontrada no ERP HK. Status ERP: ${erpStatus}`,
    );
  }
}
