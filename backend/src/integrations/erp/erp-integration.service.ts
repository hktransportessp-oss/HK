import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IdempotencyService } from './services/idempotency.service';
import { ErpSettlementWebhookDto } from './dto/erp-webhook-envelope.dto';
import { SettlementPayloadDto } from './dto/settlement-payload.dto';
import { ErpPaymentWebhookDto, PaymentPayloadDto } from './dto/payment-payload.dto';
import { ErpReceiptWebhookDto, ReceiptPayloadDto } from './dto/receipt-payload.dto';
import { ErpAdjustmentWebhookDto, AdjustmentPayloadDto } from './dto/adjustment-payload.dto';
import { TollEventDto } from './dto/toll-event.dto';
import { RomaneioEventDto } from './dto/romaneio-event.dto';
import { TollStatus, RomaneioStatus } from '@prisma/client';

@Injectable()
export class ErpIntegrationService {
  private readonly logger = new Logger(ErpIntegrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  /**
   * Resolução DETERMINÍSTICA do motorista a partir de driver.id ou driver.document (normalizado).
   * NUNCA utiliza fallbacks para motoristas aleatórios ou primeiros ativos.
   * Se não existir no banco e driver.id for informado pelo ERP, cria o registro ERP-only deterministicamente.
   */
  private async resolveDriverIdDeterministic(
    driverInfo?: { id?: string; document?: string; cpf?: string; name?: string; pix?: string },
    prismaClient?: any,
  ): Promise<string> {
    const db = prismaClient || this.prisma;

    if (!driverInfo || (!driverInfo.id && !driverInfo.document && !driverInfo.cpf)) {
      throw new BadRequestException(
        'Dados de identificação do motorista ausentes (id ou document são obrigatórios)',
      );
    }

    // A) 1. Busca direta por Driver ID
    if (driverInfo.id) {
      const driver = await db.driver.findUnique({
        where: { id: driverInfo.id },
      });
      if (driver) return driver.id;
    }

    // B) 2. Busca determinística por Documento (CPF/CNPJ normalizado)
    const rawDoc = driverInfo.document || driverInfo.cpf;
    if (rawDoc) {
      const cleanDoc = rawDoc.replace(/\D/g, '');
      const user = await db.user.findFirst({
        where: {
          OR: [
            { cpf: cleanDoc },
            { cpf: rawDoc },
          ],
        },
        include: { driver: true },
      });

      if (user?.driver) {
        return user.driver.id;
      }

      const driverByUserId = await db.driver.findFirst({
        where: {
          user: {
            OR: [
              { cpf: cleanDoc },
              { cpf: rawDoc },
            ],
          },
        },
      });

      if (driverByUserId) {
        return driverByUserId.id;
      }
    }

    // C) 3. Se ainda não existir E driver.id tiver sido fornecido pelo ERP:
    // Cria/upsert um Driver ERP-only deterministicamente
    if (driverInfo.id) {
      const createdDriver = await db.driver.upsert({
        where: { id: driverInfo.id },
        update: {},
        create: {
          id: driverInfo.id,
          userId: null,
          cnh: null,
          cnhCategory: null,
          status: 'ERP_ONLY',
        },
      });

      this.logger.log(`Motorista ERP-only criado deterministicamente: ${createdDriver.id}`);
      return createdDriver.id;
    }

    // Se não encontrado deterministicamente e nenhum driver.id foi informado para provisionar ERP_ONLY:
    throw new NotFoundException(
      `Motorista não encontrado deterministicamente no cadastro HK Central (Documento: ${driverInfo.document || driverInfo.cpf || 'N/A'}). Registro cancelado por segurança financeira.`,
    );
  }

  /**
   * Helper para resolução de viagem opcional
   */
  private async resolveTripId(tripId?: string, prismaClient?: any): Promise<string | null> {
    if (!tripId) return null;
    const db = prismaClient || this.prisma;
    const trip = await db.trip.findUnique({ where: { id: tripId } });
    return trip ? trip.id : null;
  }

  /**
   * Helper para desempacotar envelope se necessário
   */
  private unwrapPayload<T>(payloadOrEnvelope: any): { data: T; idempotencyKey?: string; event?: string; occurredAt?: string } {
    if (payloadOrEnvelope && payloadOrEnvelope.data && typeof payloadOrEnvelope.data === 'object') {
      return {
        data: payloadOrEnvelope.data,
        idempotencyKey: payloadOrEnvelope.idempotencyKey,
        event: payloadOrEnvelope.event,
        occurredAt: payloadOrEnvelope.occurredAt,
      };
    }
    return {
      data: payloadOrEnvelope,
      idempotencyKey: payloadOrEnvelope?.idempotencyKey,
      event: payloadOrEnvelope?.event,
      occurredAt: payloadOrEnvelope?.occurredAt,
    };
  }

  /**
   * Processa Webhooks de Fechamento Financeiro: settlement.created e settlement.updated
   * 1. POST /api/v1/integrations/erp/settlements
   */
  async processSettlementEvent(
    envelopeOrPayload: ErpSettlementWebhookDto | SettlementPayloadDto,
    headerIdempotencyKey?: string,
  ) {
    const { data, idempotencyKey: bodyKey, event, occurredAt } = this.unwrapPayload<SettlementPayloadDto>(envelopeOrPayload);
    const key = headerIdempotencyKey || bodyKey;

    if (!key) {
      throw new BadRequestException('Chave de idempotência ausente');
    }

    const cached = await this.idempotencyService.getProcessedResponse(key);
    if (cached) {
      return cached;
    }

    if (!data || !data.externalId) {
      throw new BadRequestException('Payload de fechamento inválido ou externalId ausente');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const driverId = await this.resolveDriverIdDeterministic(data.driver, tx);
      const tripId = await this.resolveTripId(data.internalId, tx);

      let freightAmount = 0;
      let tollAmount = 0;
      let additionalAmount = 0;
      let deductionsAmount = data.discountAmount ?? 0;

      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          const type = (item.type || '').toUpperCase();
          const amt = Number(item.amount) || 0;
          if (type === 'FREIGHT') {
            freightAmount += amt;
          } else if (type === 'TOLL') {
            tollAmount += amt;
          } else if (type === 'BONUS' || type === 'CREDIT' || type === 'ADDITIONAL') {
            additionalAmount += amt;
          } else if (type === 'DISCOUNT' || type === 'DEBIT' || type === 'DEDUCTION') {
            deductionsAmount += Math.abs(amt);
          }
        }
      }

      if (freightAmount === 0 && data.grossAmount) {
        freightAmount = data.grossAmount;
      }

      const netAmount = Number(data.netAmount) || (freightAmount + tollAmount + additionalAmount - deductionsAmount);

      const settlement = await tx.financialSettlement.upsert({
        where: { settlementCode: data.externalId },
        update: {
          driverId,
          tripId: tripId || undefined,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          freightAmount,
          tollAmount,
          additionalAmount,
          deductionsAmount,
          netAmount,
          status: data.status || 'APPROVED',
        },
        create: {
          settlementCode: data.externalId,
          driverId,
          tripId: tripId || null,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          freightAmount,
          tollAmount,
          additionalAmount,
          deductionsAmount,
          netAmount,
          status: data.status || 'APPROVED',
        },
      });

      await tx.financialSettlementItem.deleteMany({
        where: { settlementId: settlement.id },
      });

      if (data.items && data.items.length > 0) {
        await tx.financialSettlementItem.createMany({
          data: data.items.map((item) => ({
            settlementId: settlement.id,
            description: item.description || item.externalId || 'Item de Fechamento',
            type: item.type || 'FREIGHT',
            amount: Number(item.amount) || 0,
          })),
        });
      }

      const responsePayload = {
        success: true,
        event: event || 'settlement.created',
        action: (event === 'settlement.updated') ? 'UPDATED' : 'CREATED',
        settlementId: settlement.id,
        settlementCode: settlement.settlementCode,
        netAmount: settlement.netAmount,
        status: settlement.status,
        occurredAt: occurredAt || new Date().toISOString(),
        processedAt: new Date().toISOString(),
      };

      await this.idempotencyService.recordResponse(
        key,
        responsePayload,
        `/api/v1/integrations/erp/settlements`,
        tx,
      );

      return responsePayload;
    });

    return result;
  }

  /**
   * Processa Webhooks de Pagamento: payment.confirmed
   * 2. POST /api/v1/integrations/erp/payments
   */
  async processPaymentEvent(
    envelopeOrPayload: ErpPaymentWebhookDto | PaymentPayloadDto,
    headerIdempotencyKey?: string,
  ) {
    const { data, idempotencyKey: bodyKey, event, occurredAt } = this.unwrapPayload<PaymentPayloadDto>(envelopeOrPayload);
    const key = headerIdempotencyKey || bodyKey;

    if (!key) {
      throw new BadRequestException('Chave de idempotência ausente');
    }

    const cached = await this.idempotencyService.getProcessedResponse(key);
    if (cached) {
      return cached;
    }

    if (!data || (!data.settlementId && !data.settlementCode && !data.externalId)) {
      throw new BadRequestException('Identificador do fechamento ou pagamento ausente');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      let settlement = null;
      const targetSettlementCode = data.settlementCode || data.settlementId;

      if (targetSettlementCode) {
        settlement = await tx.financialSettlement.findFirst({
          where: {
            OR: [
              { settlementCode: targetSettlementCode },
              { id: targetSettlementCode },
            ],
          },
        });
      }

      if (!settlement) {
        throw new NotFoundException(
          `Fechamento financeiro "${targetSettlementCode}" não localizado para registrar pagamento`,
        );
      }

      const paymentDateRaw = data.paidAt || data.paymentDate;
      const paymentDate = paymentDateRaw ? new Date(paymentDateRaw) : new Date();
      const method = data.method || data.paymentMethod || 'PIX';
      const receiptUrl = data.proofUrl || data.receiptUrl || null;
      const status = data.status || 'PAID';

      const payment = await tx.payment.create({
        data: {
          settlementId: settlement.id,
          amount: Number(data.amount) || 0,
          paymentDate,
          paymentMethod: method,
          status,
          transactionId: data.transactionId || data.externalId || null,
          receiptUrl,
        },
      });

      if (status === 'PAID') {
        await tx.financialSettlement.update({
          where: { id: settlement.id },
          data: { status: 'PAID' },
        });
      }

      const responsePayload = {
        success: true,
        event: event || 'payment.confirmed',
        action: 'PAYMENT_RECORDED',
        paymentId: payment.id,
        settlementCode: settlement.settlementCode,
        amount: payment.amount,
        paymentStatus: payment.status,
        transactionId: payment.transactionId,
        occurredAt: occurredAt || new Date().toISOString(),
        processedAt: new Date().toISOString(),
      };

      await this.idempotencyService.recordResponse(
        key,
        responsePayload,
        `/api/v1/integrations/erp/payments`,
        tx,
      );

      return responsePayload;
    });

    return result;
  }

  /**
   * Processa Webhooks de Comprovantes: receipt.verified / receipt.uploaded
   * 3. POST /api/v1/integrations/erp/receipts
   */
  async processReceiptEvent(
    envelopeOrPayload: ErpReceiptWebhookDto | ReceiptPayloadDto,
    headerIdempotencyKey?: string,
  ) {
    const { data, idempotencyKey: bodyKey, event, occurredAt } = this.unwrapPayload<ReceiptPayloadDto>(envelopeOrPayload);
    const key = headerIdempotencyKey || bodyKey;

    if (!key) {
      throw new BadRequestException('Chave de idempotência ausente');
    }

    const cached = await this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    const result = await this.prisma.$transaction(async (tx) => {
      const fileUrl = data.receiptUrl || data.fileUrl;
      let updatedEntity: any = null;

      if (data.type === 'TOLL' && data.entityId) {
        const toll = await tx.toll.findUnique({ where: { id: data.entityId } });
        if (toll) {
          updatedEntity = await tx.toll.update({
            where: { id: toll.id },
            data: {
              receiptUrl: fileUrl || toll.receiptUrl,
              status: data.status === 'VERIFIED' ? TollStatus.APPROVED : toll.status,
              notes: data.notes || toll.notes,
            },
          });
        }
      }

      const responsePayload = {
        success: true,
        event: event || 'receipt.verified',
        action: 'RECEIPT_PROCESSED',
        externalId: data.externalId,
        type: data.type,
        entityId: data.entityId,
        status: data.status || 'VERIFIED',
        updated: Boolean(updatedEntity),
        occurredAt: occurredAt || new Date().toISOString(),
        processedAt: new Date().toISOString(),
      };

      await this.idempotencyService.recordResponse(
        key,
        responsePayload,
        `/api/v1/integrations/erp/receipts`,
        tx,
      );

      return responsePayload;
    });

    return result;
  }

  /**
   * Processa Webhooks de Ajustes Financeiros: adjustment.created
   * 4. POST /api/v1/integrations/erp/adjustments
   */
  async processAdjustmentEvent(
    envelopeOrPayload: ErpAdjustmentWebhookDto | AdjustmentPayloadDto,
    headerIdempotencyKey?: string,
  ) {
    const { data, idempotencyKey: bodyKey, event, occurredAt } = this.unwrapPayload<AdjustmentPayloadDto>(envelopeOrPayload);
    const key = headerIdempotencyKey || bodyKey;

    if (!key) {
      throw new BadRequestException('Chave de idempotência ausente');
    }

    const cached = await this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    const result = await this.prisma.$transaction(async (tx) => {
      let settlement = null;
      if (data.settlementId) {
        settlement = await tx.financialSettlement.findFirst({
          where: {
            OR: [
              { id: data.settlementId },
              { settlementCode: data.settlementId },
            ],
          },
        });
      }

      let createdItem = null;
      if (settlement) {
        createdItem = await tx.financialSettlementItem.create({
          data: {
            settlementId: settlement.id,
            description: data.description || `Ajuste ${data.externalId}`,
            type: (data.type || 'BONUS').toUpperCase(),
            amount: Number(data.amount) || 0,
          },
        });

        // Recalcular saldo líquido do fechamento
        const allItems = await tx.financialSettlementItem.findMany({
          where: { settlementId: settlement.id },
        });

        let freight = 0;
        let toll = 0;
        let additionals = 0;
        let deductions = 0;

        for (const it of allItems) {
          const t = it.type.toUpperCase();
          const a = Number(it.amount) || 0;
          if (t === 'FREIGHT') freight += a;
          else if (t === 'TOLL') toll += a;
          else if (t === 'BONUS' || t === 'CREDIT' || t === 'ADDITIONAL') additionals += a;
          else if (t === 'DISCOUNT' || t === 'DEBIT' || t === 'DEDUCTION') deductions += Math.abs(a);
        }

        const netAmount = freight + toll + additionals - deductions;

        await tx.financialSettlement.update({
          where: { id: settlement.id },
          data: {
            freightAmount: freight,
            tollAmount: toll,
            additionalAmount: additionals,
            deductionsAmount: deductions,
            netAmount,
          },
        });
      }

      const responsePayload = {
        success: true,
        event: event || 'adjustment.created',
        action: 'ADJUSTMENT_RECORDED',
        externalId: data.externalId,
        adjustmentItemId: createdItem?.id || null,
        settlementId: settlement?.id || null,
        amount: Number(data.amount) || 0,
        occurredAt: occurredAt || new Date().toISOString(),
        processedAt: new Date().toISOString(),
      };

      await this.idempotencyService.recordResponse(
        key,
        responsePayload,
        `/api/v1/integrations/erp/adjustments`,
        tx,
      );

      return responsePayload;
    });

    return result;
  }

  /**
   * Sincronização de Pedágios
   * 5. POST /api/v1/integrations/erp/tolls
   */
  async processTollEvent(dtoOrEnvelope: any, headerIdempotencyKey?: string) {
    const { data, idempotencyKey: bodyKey } = this.unwrapPayload<any>(dtoOrEnvelope);
    const key = headerIdempotencyKey || bodyKey || data.idempotencyKey;

    if (!key) {
      throw new BadRequestException('Chave de idempotência ausente');
    }

    const cached = await this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    const result = await this.prisma.$transaction(async (tx) => {
      let toll = null;
      const tollTargetId = data.tollId || data.externalId;

      if (tollTargetId) {
        toll = await tx.toll.findUnique({ where: { id: tollTargetId } });
      }

      if (toll) {
        toll = await tx.toll.update({
          where: { id: toll.id },
          data: {
            status: data.status || TollStatus.APPROVED,
            notes: data.notes || toll.notes,
            receiptUrl: data.receiptUrl || toll.receiptUrl,
          },
        });
      } else {
        const driverId = await this.resolveDriverIdDeterministic(
          data.driver || { id: data.driverId, document: data.driverCpf, cpf: data.driverCpf },
          tx,
        );

        toll = await tx.toll.create({
          data: {
            driverId,
            tripId: data.tripId || null,
            amount: Number(data.amount) || 0,
            date: data.date || new Date().toISOString().split('T')[0],
            plaza: data.plaza || 'Praça de Pedágio',
            highway: data.highway || 'Rodovia',
            receiptUrl: data.receiptUrl || null,
            notes: data.notes,
            status: data.status || TollStatus.APPROVED,
          },
        });
      }

      const responsePayload = {
        success: true,
        action: 'TOLL_SYNCHRONIZED',
        tollId: toll.id,
        status: toll.status,
        amount: toll.amount,
      };

      await this.idempotencyService.recordResponse(
        key,
        responsePayload,
        `/api/v1/integrations/erp/tolls`,
        tx,
      );

      return responsePayload;
    });

    return result;
  }

  /**
   * Sincronização de Romaneios
   * 6. POST /api/v1/integrations/erp/romaneios
   */
  async processRomaneioEvent(dtoOrEnvelope: any, headerIdempotencyKey?: string) {
    const { data, idempotencyKey: bodyKey } = this.unwrapPayload<any>(dtoOrEnvelope);
    const key = headerIdempotencyKey || bodyKey || data.idempotencyKey;

    if (!key) {
      throw new BadRequestException('Chave de idempotência ausente');
    }

    const cached = await this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    const result = await this.prisma.$transaction(async (tx) => {
      const driverId = await this.resolveDriverIdDeterministic(
        data.driver || { id: data.driverId, document: data.driverCpf, cpf: data.driverCpf },
        tx,
      );
      const tripId = await this.resolveTripId(data.tripId, tx);

      const romaneio = await tx.romaneio.upsert({
        where: { romaneioCode: data.romaneioCode },
        update: {
          status: data.status || RomaneioStatus.APPROVED,
          notes: data.notes,
        },
        create: {
          romaneioCode: data.romaneioCode,
          driverId,
          tripId,
          status: data.status || RomaneioStatus.APPROVED,
          notes: data.notes,
        },
      });

      if (data.documents && data.documents.length > 0) {
        for (const doc of data.documents) {
          await tx.romaneioDocument.create({
            data: {
              romaneioId: romaneio.id,
              documentType: doc.documentType || 'NFE',
              documentNumber: doc.documentNumber,
              accessKey: doc.accessKey,
              fileUrl: doc.fileUrl,
            },
          });
        }
      }

      const responsePayload = {
        success: true,
        action: 'ROMANEIO_SYNCHRONIZED',
        romaneioId: romaneio.id,
        romaneioCode: romaneio.romaneioCode,
        status: romaneio.status,
      };

      await this.idempotencyService.recordResponse(
        key,
        responsePayload,
        `/api/v1/integrations/erp/romaneios`,
        tx,
      );

      return responsePayload;
    });

    return result;
  }

  /**
   * Receptor genérico de Webhooks do ecossistema ERP
   * 7. POST /api/v1/integrations/erp/events
   */
  async processGenericEvent(envelope: any, headerIdempotencyKey?: string) {
    const key = headerIdempotencyKey || envelope.idempotencyKey;
    if (!key) {
      throw new BadRequestException('Chave de idempotência ausente');
    }

    const cached = await this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    const event = envelope.event || envelope.eventType;

    if (event === 'settlement.created' || event === 'settlement.updated') {
      return this.processSettlementEvent(envelope as ErpSettlementWebhookDto, key);
    } else if (event === 'payment.confirmed' || event === 'payment.created') {
      return this.processPaymentEvent(envelope as ErpPaymentWebhookDto, key);
    } else if (event === 'receipt.verified' || event === 'receipt.uploaded') {
      return this.processReceiptEvent(envelope as ErpReceiptWebhookDto, key);
    } else if (event === 'adjustment.created' || event === 'adjustment.updated') {
      return this.processAdjustmentEvent(envelope as ErpAdjustmentWebhookDto, key);
    } else if (event?.startsWith('toll.')) {
      return this.processTollEvent(envelope, key);
    } else if (event?.startsWith('romaneio.')) {
      return this.processRomaneioEvent(envelope, key);
    } else {
      const responsePayload = {
        success: true,
        acknowledged: true,
        event,
        message: `Evento "${event}" recebido e registrado com sucesso`,
        occurredAt: envelope.occurredAt || new Date().toISOString(),
        processedAt: new Date().toISOString(),
      };

      await this.idempotencyService.recordResponse(
        key,
        responsePayload,
        `/api/v1/integrations/erp/events`,
      );

      return responsePayload;
    }
  }
}
