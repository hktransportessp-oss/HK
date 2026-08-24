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
   * Resolução DETERMINÍSTICA e segura do motorista.
   * NUNCA utiliza fallbacks para motoristas aleatórios ou primeiros ativos.
   */
  private async resolveDriverIdDeterministic(
    driverInfo?: { id?: string; cpf?: string; name?: string },
    prismaClient?: any,
  ): Promise<string> {
    const db = prismaClient || this.prisma;

    if (!driverInfo || (!driverInfo.id && !driverInfo.cpf)) {
      throw new BadRequestException(
        'Dados de identificação do motorista ausentes (id ou cpf são obrigatórios)',
      );
    }

    // 1. Busca direta por Driver ID
    if (driverInfo.id) {
      const driver = await db.driver.findUnique({
        where: { id: driverInfo.id },
      });
      if (driver) return driver.id;
    }

    // 2. Busca determinística por CPF
    if (driverInfo.cpf) {
      const cleanCpf = driverInfo.cpf.replace(/\D/g, '');
      const user = await db.user.findFirst({
        where: {
          OR: [
            { cpf: cleanCpf },
            { cpf: driverInfo.cpf },
          ],
        },
        include: { driver: true },
      });

      if (user?.driver) {
        return user.driver.id;
      }

      // Tenta buscar no motorista diretamente caso haja campo de CPF ou similar
      const driverByUserId = await db.driver.findFirst({
        where: {
          user: {
            OR: [
              { cpf: cleanCpf },
              { cpf: driverInfo.cpf },
            ],
          },
        },
      });

      if (driverByUserId) {
        return driverByUserId.id;
      }
    }

    // Se não encontrado deterministicamente, REJEITA OBRIGATORIAMENTE sem alterar o banco
    throw new NotFoundException(
      `Motorista não encontrado deterministicamente no cadastro HK Central (CPF: ${driverInfo.cpf || 'N/A'}, ID: ${driverInfo.id || 'N/A'}). Registro cancelado por segurança financeira.`,
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
   * Processa Webhooks de Fechamento Financeiro: settlement.created e settlement.updated
   * Executado de forma estritamente TRANSACIONAL no PostgreSQL com registro atômico de idempotência.
   */
  async processSettlementEvent(
    envelope: ErpSettlementWebhookDto,
    headerIdempotencyKey?: string,
  ) {
    const key = headerIdempotencyKey || envelope.idempotencyKey;
    if (!key) {
      throw new BadRequestException('Chave de idempotência ausente');
    }

    // 1. Verificação prévia de Idempotência no PostgreSQL
    const cached = await this.idempotencyService.getProcessedResponse(key);
    if (cached) {
      return cached;
    }

    const data: SettlementPayloadDto = envelope.data;
    if (!data || !data.externalId) {
      throw new BadRequestException('Payload de dados do fechamento inválido ou externalId ausente');
    }

    this.logger.log(
      `[ERP ${envelope.event}] Processando fechamento ${data.externalId} para o motorista CPF: ${data.driver?.cpf || data.driver?.id}`,
    );

    // 2. Execução Atômica e Transacional
    const result = await this.prisma.$transaction(async (tx) => {
      // Resolução determinística do motorista dentro da transação
      const driverId = await this.resolveDriverIdDeterministic(data.driver, tx);
      const tripId = await this.resolveTripId(data.internalId, tx);

      // Calcular montantes com base no payload e itens
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

      // Se grossAmount for fornecido e frete não estiver discriminado, atribui ao frete
      if (freightAmount === 0 && data.grossAmount) {
        freightAmount = data.grossAmount;
      }

      const netAmount = Number(data.netAmount) || (freightAmount + tollAmount + additionalAmount - deductionsAmount);

      // Upsert do fechamento financeiro
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

      // Substituição atômica dos itens discriminados
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
        event: envelope.event,
        action: envelope.event === 'settlement.created' ? 'CREATED' : 'UPDATED',
        settlementId: settlement.id,
        settlementCode: settlement.settlementCode,
        netAmount: settlement.netAmount,
        status: settlement.status,
        occurredAt: envelope.occurredAt,
        processedAt: new Date().toISOString(),
      };

      // Gravação atômica da chave de idempotência dentro da mesma transação
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
   * Processa Webhook de Pagamento: payment.confirmed
   */
  async processPaymentEvent(
    envelope: ErpPaymentWebhookDto,
    headerIdempotencyKey?: string,
  ) {
    const key = headerIdempotencyKey || envelope.idempotencyKey;
    if (!key) {
      throw new BadRequestException('Chave de idempotência ausente');
    }

    const cached = await this.idempotencyService.getProcessedResponse(key);
    if (cached) {
      return cached;
    }

    const data: PaymentPayloadDto = envelope.data;
    if (!data || (!data.settlementCode && !data.settlementId)) {
      throw new BadRequestException('Código ou ID do fechamento ausente no evento de pagamento');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      let settlement = null;
      if (data.settlementCode) {
        settlement = await tx.financialSettlement.findUnique({
          where: { settlementCode: data.settlementCode },
        });
      } else if (data.settlementId) {
        settlement = await tx.financialSettlement.findUnique({
          where: { id: data.settlementId },
        });
      }

      if (!settlement) {
        throw new NotFoundException(
          `Fechamento financeiro "${data.settlementCode || data.settlementId}" não localizado para registrar pagamento`,
        );
      }

      const payment = await tx.payment.create({
        data: {
          settlementId: settlement.id,
          amount: Number(data.amount) || 0,
          paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
          paymentMethod: data.paymentMethod || 'PIX',
          status: data.status || 'PAID',
          transactionId: data.transactionId || data.externalId || null,
          receiptUrl: data.receiptUrl || null,
        },
      });

      if (data.status === 'PAID' || !data.status) {
        await tx.financialSettlement.update({
          where: { id: settlement.id },
          data: { status: 'PAID' },
        });
      }

      const responsePayload = {
        success: true,
        event: envelope.event,
        action: 'PAYMENT_RECORDED',
        paymentId: payment.id,
        settlementCode: settlement.settlementCode,
        amount: payment.amount,
        paymentStatus: payment.status,
        transactionId: payment.transactionId,
        occurredAt: envelope.occurredAt,
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
   * Sincronização de Pedágios validados no ERP
   */
  async processTollEvent(dto: TollEventDto, idempotencyKey: string) {
    const cached = await this.idempotencyService.getProcessedResponse(idempotencyKey);
    if (cached) return cached;

    const result = await this.prisma.$transaction(async (tx) => {
      let toll = null;
      if (dto.tollId) {
        toll = await tx.toll.findUnique({ where: { id: dto.tollId } });
      }

      if (toll) {
        toll = await tx.toll.update({
          where: { id: toll.id },
          data: {
            status: dto.status || TollStatus.APPROVED,
            notes: dto.notes || toll.notes,
          },
        });
      } else {
        const driverId = await this.resolveDriverIdDeterministic(
          { id: dto.driverId, cpf: dto.driverCpf },
          tx,
        );

        toll = await tx.toll.create({
          data: {
            driverId,
            tripId: dto.tripId || null,
            amount: dto.amount ?? 0,
            date: dto.date || new Date().toISOString().split('T')[0],
            plaza: dto.plaza || 'Praça de Pedágio',
            highway: dto.highway || 'Rodovia',
            receiptUrl: dto.receiptUrl || null,
            notes: dto.notes,
            status: dto.status || TollStatus.APPROVED,
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
        idempotencyKey,
        responsePayload,
        `/api/v1/integrations/erp/tolls`,
        tx,
      );

      return responsePayload;
    });

    return result;
  }

  /**
   * Sincronização de Romaneios validados no ERP
   */
  async processRomaneioEvent(dto: RomaneioEventDto, idempotencyKey: string) {
    const cached = await this.idempotencyService.getProcessedResponse(idempotencyKey);
    if (cached) return cached;

    const result = await this.prisma.$transaction(async (tx) => {
      const driverId = await this.resolveDriverIdDeterministic(
        { id: dto.driverId, cpf: dto.driverCpf },
        tx,
      );
      const tripId = await this.resolveTripId(dto.tripId, tx);

      const romaneio = await tx.romaneio.upsert({
        where: { romaneioCode: dto.romaneioCode },
        update: {
          status: dto.status || RomaneioStatus.APPROVED,
          notes: dto.notes,
        },
        create: {
          romaneioCode: dto.romaneioCode,
          driverId,
          tripId,
          status: dto.status || RomaneioStatus.APPROVED,
          notes: dto.notes,
        },
      });

      if (dto.documents && dto.documents.length > 0) {
        for (const doc of dto.documents) {
          await tx.romaneioDocument.create({
            data: {
              romaneioId: romaneio.id,
              documentType: doc.documentType,
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
        idempotencyKey,
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
   */
  async processGenericEvent(envelope: any, idempotencyKey: string) {
    const key = idempotencyKey || envelope.idempotencyKey;
    const cached = await this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    const event = envelope.event || envelope.eventType;

    let subResult = null;
    if (event === 'settlement.created' || event === 'settlement.updated') {
      subResult = await this.processSettlementEvent(envelope as ErpSettlementWebhookDto, key);
      return subResult;
    } else if (event === 'payment.confirmed' || event === 'payment.created') {
      subResult = await this.processPaymentEvent(envelope as ErpPaymentWebhookDto, key);
      return subResult;
    } else {
      // Evento sem mapeamento financeiro seguro: armazena sem alterar dados financeiros incorretamente
      const responsePayload = {
        success: true,
        acknowledged: true,
        event,
        message: `Evento "${event}" recebido e armazenado com sucesso`,
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
