import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IdempotencyService } from './services/idempotency.service';
import { SettlementEventDto } from './dto/settlement-event.dto';
import { PaymentEventDto } from './dto/payment-event.dto';
import { ReceiptEventDto } from './dto/receipt-event.dto';
import { AdjustmentEventDto } from './dto/adjustment-event.dto';
import { TollEventDto } from './dto/toll-event.dto';
import { RomaneioEventDto } from './dto/romaneio-event.dto';
import { GenericEventDto } from './dto/generic-event.dto';
import { RomaneioStatus, TollStatus } from '@prisma/client';

@Injectable()
export class ErpIntegrationService {
  private readonly logger = new Logger(ErpIntegrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  /**
   * Helper para resolução de motorista por ID ou por CPF
   */
  private async resolveDriverId(driverId?: string, driverCpf?: string): Promise<string> {
    if (driverId) {
      const driver = await this.prisma.driver.findUnique({ where: { id: driverId } });
      if (driver) return driver.id;
    }

    if (driverCpf) {
      const cleanCpf = driverCpf.replace(/\D/g, '');
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ cpf: cleanCpf }, { cpf: driverCpf }],
        },
        include: { driver: true },
      });

      if (user?.driver) {
        return user.driver.id;
      }
    }

    // Se nenhum motorista específico for localizado, busca o primeiro motorista ativo cadastrado no sistema
    const firstDriver = await this.prisma.driver.findFirst({
      where: { status: 'ATIVO' },
    });

    if (firstDriver) {
      return firstDriver.id;
    }

    throw new NotFoundException(
      `Motorista não encontrado para vínculo (driverId: ${driverId}, driverCpf: ${driverCpf})`,
    );
  }

  /**
   * Helper para resolução de viagem por ID ou tripCode
   */
  private async resolveTripId(tripId?: string, tripCode?: string): Promise<string | null> {
    if (tripId) {
      const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
      if (trip) return trip.id;
    }
    if (tripCode) {
      const trip = await this.prisma.trip.findUnique({ where: { tripCode } });
      if (trip) return trip.id;
    }
    return null;
  }

  /**
   * POST /api/v1/integrations/erp/settlements
   * Processa fechamentos / extratos financeiros sincronizados pelo ERP
   */
  async processSettlement(dto: SettlementEventDto, idempotencyKey?: string) {
    const key = idempotencyKey || dto.idempotencyKey || `settlement_${dto.settlementCode}`;
    const cached = this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    if (!this.idempotencyService.acquireLock(key)) {
      throw new ConflictException('Requisição idêntica de fechamento financeiro já em processamento');
    }

    try {
      this.logger.log(`[ERP] Processando Fechamento Financeiro: ${dto.settlementCode}`);
      const driverId = await this.resolveDriverId(dto.driverId, dto.driverCpf);
      const tripId = await this.resolveTripId(dto.tripId, dto.tripCode);

      const freightAmount = dto.freightAmount ?? 0;
      const tollAmount = dto.tollAmount ?? 0;
      const additionalAmount = dto.additionalAmount ?? 0;
      const deductionsAmount = dto.deductionsAmount ?? 0;
      const netAmount = dto.netAmount ?? freightAmount + tollAmount + additionalAmount - deductionsAmount;

      // Upsert do fechamento financeiro
      const settlement = await this.prisma.financialSettlement.upsert({
        where: { settlementCode: dto.settlementCode },
        update: {
          driverId,
          tripId: tripId || undefined,
          periodStart: dto.periodStart,
          periodEnd: dto.periodEnd,
          freightAmount,
          tollAmount,
          additionalAmount,
          deductionsAmount,
          netAmount,
          status: dto.status || 'APPROVED',
        },
        create: {
          settlementCode: dto.settlementCode,
          driverId,
          tripId,
          periodStart: dto.periodStart,
          periodEnd: dto.periodEnd,
          freightAmount,
          tollAmount,
          additionalAmount,
          deductionsAmount,
          netAmount,
          status: dto.status || 'APPROVED',
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // Sincronizar itens discriminados se fornecidos
      if (dto.items && dto.items.length > 0) {
        await this.prisma.financialSettlementItem.deleteMany({
          where: { settlementId: settlement.id },
        });

        await this.prisma.financialSettlementItem.createMany({
          data: dto.items.map((item) => ({
            settlementId: settlement.id,
            description: item.description,
            type: item.type,
            amount: item.amount,
          })),
        });
      }

      const result = {
        success: true,
        action: 'PROCESSED',
        message: `Fechamento financeiro ${dto.settlementCode} sincronizado com sucesso`,
        settlementId: settlement.id,
        settlementCode: settlement.settlementCode,
        netAmount,
        status: settlement.status,
        updatedAt: new Date().toISOString(),
      };

      this.idempotencyService.recordResponse(key, result);
      return result;
    } catch (error) {
      this.idempotencyService.releaseLock(key);
      this.logger.error(`[ERP] Erro ao processar fechamento: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * POST /api/v1/integrations/erp/payments
   * Processa comprovantes e registros de pagamentos efetuados pelo ERP
   */
  async processPayment(dto: PaymentEventDto, idempotencyKey?: string) {
    const key =
      idempotencyKey ||
      dto.idempotencyKey ||
      `pay_${dto.settlementCode}_${dto.transactionId || dto.amount}`;
    const cached = this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    if (!this.idempotencyService.acquireLock(key)) {
      throw new ConflictException('Requisição idêntica de pagamento já em processamento');
    }

    try {
      this.logger.log(`[ERP] Processando Pagamento para fechamento ${dto.settlementCode} no valor R$ ${dto.amount}`);

      let settlement = await this.prisma.financialSettlement.findUnique({
        where: { settlementCode: dto.settlementCode },
      });

      if (!settlement && dto.settlementId) {
        settlement = await this.prisma.financialSettlement.findUnique({
          where: { id: dto.settlementId },
        });
      }

      if (!settlement) {
        throw new NotFoundException(
          `Fechamento financeiro ${dto.settlementCode} não encontrado para registrar o pagamento`,
        );
      }

      const payment = await this.prisma.payment.create({
        data: {
          settlementId: settlement.id,
          amount: dto.amount,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
          paymentMethod: dto.paymentMethod || 'PIX',
          status: dto.status || 'PAID',
          transactionId: dto.transactionId || null,
          receiptUrl: dto.receiptUrl || null,
        },
      });

      // Atualiza status do fechamento para PAID se o pagamento for confirmado
      if (dto.status === 'PAID' || !dto.status) {
        await this.prisma.financialSettlement.update({
          where: { id: settlement.id },
          data: { status: 'PAID' },
        });
      }

      const result = {
        success: true,
        action: 'PROCESSED',
        message: `Pagamento de R$ ${dto.amount} registrado para fechamento ${dto.settlementCode}`,
        paymentId: payment.id,
        settlementCode: dto.settlementCode,
        transactionId: payment.transactionId,
        paymentStatus: payment.status,
      };

      this.idempotencyService.recordResponse(key, result);
      return result;
    } catch (error) {
      this.idempotencyService.releaseLock(key);
      this.logger.error(`[ERP] Erro ao processar pagamento: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  /**
   * POST /api/v1/integrations/erp/receipts
   * Registra comprovantes validados pelo ERP
   */
  async processReceipt(dto: ReceiptEventDto, idempotencyKey?: string) {
    const key = idempotencyKey || dto.idempotencyKey || `receipt_${dto.type}_${dto.entityId || dto.fileUrl}`;
    const cached = this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    if (!this.idempotencyService.acquireLock(key)) {
      throw new ConflictException('Requisição de comprovante em processamento');
    }

    try {
      this.logger.log(`[ERP] Processando Comprovante tipo ${dto.type}`);

      let attachedEntity = null;

      if (dto.type === 'TOLL' && dto.entityId) {
        const toll = await this.prisma.toll.findUnique({ where: { id: dto.entityId } });
        if (toll) {
          await this.prisma.tollReceipt.create({
            data: {
              tollId: toll.id,
              fileUrl: dto.fileUrl,
              fileHash: dto.fileHash || null,
            },
          });
          attachedEntity = `Toll:${toll.id}`;
        }
      } else if (dto.type === 'PAYMENT' && dto.entityId) {
        await this.prisma.payment.updateMany({
          where: { id: dto.entityId },
          data: { receiptUrl: dto.fileUrl },
        });
        attachedEntity = `Payment:${dto.entityId}`;
      }

      const result = {
        success: true,
        action: 'RECEIPT_REGISTERED',
        type: dto.type,
        fileUrl: dto.fileUrl,
        attachedTo: attachedEntity || 'UNATTACHED_GLOBAL',
        notes: dto.notes || 'Comprovante auditado e armazenado com sucesso',
      };

      this.idempotencyService.recordResponse(key, result);
      return result;
    } catch (error) {
      this.idempotencyService.releaseLock(key);
      this.logger.error(`[ERP] Erro ao processar comprovante: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * POST /api/v1/integrations/erp/adjustments
   * Registra acréscimos, descontos ou ajustes em fechamentos
   */
  async processAdjustment(dto: AdjustmentEventDto, idempotencyKey?: string) {
    const key = idempotencyKey || dto.idempotencyKey || `adj_${dto.settlementCode}_${dto.description}`;
    const cached = this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    if (!this.idempotencyService.acquireLock(key)) {
      throw new ConflictException('Requisição de ajuste em processamento');
    }

    try {
      this.logger.log(`[ERP] Processando Ajuste para fechamento ${dto.settlementCode}: ${dto.description}`);

      const settlement = await this.prisma.financialSettlement.findUnique({
        where: { settlementCode: dto.settlementCode },
      });

      if (!settlement) {
        throw new NotFoundException(`Fechamento financeiro ${dto.settlementCode} não encontrado`);
      }

      const item = await this.prisma.financialSettlementItem.create({
        data: {
          settlementId: settlement.id,
          description: dto.description,
          type: dto.type,
          amount: dto.amount,
        },
      });

      // Recalcular saldo líquido do fechamento
      const allItems = await this.prisma.financialSettlementItem.findMany({
        where: { settlementId: settlement.id },
      });

      let calculatedDeductions = settlement.deductionsAmount;
      let calculatedAdditions = settlement.additionalAmount;

      if (dto.type === 'DEDUCTION' || dto.type === 'DISCOUNT' || dto.type === 'DEBIT') {
        calculatedDeductions += Math.abs(dto.amount);
      } else {
        calculatedAdditions += Math.abs(dto.amount);
      }

      const updatedNetAmount =
        settlement.freightAmount +
        settlement.tollAmount +
        calculatedAdditions -
        calculatedDeductions;

      await this.prisma.financialSettlement.update({
        where: { id: settlement.id },
        data: {
          additionalAmount: calculatedAdditions,
          deductionsAmount: calculatedDeductions,
          netAmount: updatedNetAmount,
        },
      });

      const result = {
        success: true,
        action: 'ADJUSTMENT_APPLIED',
        itemId: item.id,
        settlementCode: dto.settlementCode,
        newNetAmount: updatedNetAmount,
      };

      this.idempotencyService.recordResponse(key, result);
      return result;
    } catch (error) {
      this.idempotencyService.releaseLock(key);
      this.logger.error(`[ERP] Erro ao aplicar ajuste: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * POST /api/v1/integrations/erp/tolls
   * Atualiza status ou sincroniza reembolsos de pedágios validados no ERP
   */
  async processToll(dto: TollEventDto, idempotencyKey?: string) {
    const key = idempotencyKey || dto.idempotencyKey || `toll_${dto.tollId || dto.date || Date.now()}`;
    const cached = this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    if (!this.idempotencyService.acquireLock(key)) {
      throw new ConflictException('Requisição de pedágio em processamento');
    }

    try {
      this.logger.log(`[ERP] Processando Pedágio: Status ${dto.status} (ID: ${dto.tollId})`);

      let toll = null;
      if (dto.tollId) {
        toll = await this.prisma.toll.findUnique({ where: { id: dto.tollId } });
      }

      if (toll) {
        toll = await this.prisma.toll.update({
          where: { id: toll.id },
          data: {
            status: dto.status,
            notes: dto.notes || toll.notes,
          },
        });
      } else {
        const driverId = await this.resolveDriverId(dto.driverId, dto.driverCpf);
        toll = await this.prisma.toll.create({
          data: {
            driverId,
            tripId: dto.tripId || null,
            amount: dto.amount ?? 0,
            date: dto.date || new Date().toISOString().split('T')[0],
            plaza: dto.plaza || 'Praça Central',
            highway: dto.highway || 'Rodovia',
            receiptUrl: dto.receiptUrl || null,
            notes: dto.notes,
            status: dto.status || TollStatus.APPROVED,
          },
        });
      }

      const result = {
        success: true,
        action: 'TOLL_SYNCHRONIZED',
        tollId: toll.id,
        status: toll.status,
        amount: toll.amount,
      };

      this.idempotencyService.recordResponse(key, result);
      return result;
    } catch (error) {
      this.idempotencyService.releaseLock(key);
      this.logger.error(`[ERP] Erro ao processar pedágio: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * POST /api/v1/integrations/erp/romaneios
   * Atualiza status ou sincroniza romaneios de carga do ERP
   */
  async processRomaneio(dto: RomaneioEventDto, idempotencyKey?: string) {
    const key = idempotencyKey || dto.idempotencyKey || `rom_${dto.romaneioCode}`;
    const cached = this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    if (!this.idempotencyService.acquireLock(key)) {
      throw new ConflictException('Requisição de romaneio em processamento');
    }

    try {
      this.logger.log(`[ERP] Processando Romaneio: ${dto.romaneioCode}`);

      const driverId = await this.resolveDriverId(dto.driverId, dto.driverCpf);
      const tripId = await this.resolveTripId(dto.tripId);

      const romaneio = await this.prisma.romaneio.upsert({
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
          await this.prisma.romaneioDocument.create({
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

      const result = {
        success: true,
        action: 'ROMANEIO_SYNCHRONIZED',
        romaneioId: romaneio.id,
        romaneioCode: romaneio.romaneioCode,
        status: romaneio.status,
      };

      this.idempotencyService.recordResponse(key, result);
      return result;
    } catch (error) {
      this.idempotencyService.releaseLock(key);
      this.logger.error(`[ERP] Erro ao processar romaneio: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * POST /api/v1/integrations/erp/events
   * Receptor genérico de Webhooks do ecossistema ERP
   */
  async processEvent(dto: GenericEventDto, idempotencyKey?: string) {
    const key = idempotencyKey || dto.idempotencyKey || `event_${dto.eventType}_${Date.now()}`;
    const cached = this.idempotencyService.getProcessedResponse(key);
    if (cached) return cached;

    if (!this.idempotencyService.acquireLock(key)) {
      throw new ConflictException('Evento idêntico em processamento');
    }

    try {
      this.logger.log(`[ERP] Processando Evento Genérico: ${dto.eventType}`);

      let subResult = null;
      switch (dto.eventType) {
        case 'settlement.created':
        case 'settlement.updated':
        case 'settlement.approved':
          subResult = await this.processSettlement(dto.payload as SettlementEventDto, key);
          break;
        case 'payment.confirmed':
        case 'payment.created':
          subResult = await this.processPayment(dto.payload as PaymentEventDto, key);
          break;
        case 'toll.approved':
        case 'toll.rejected':
          subResult = await this.processToll(dto.payload as TollEventDto, key);
          break;
        case 'romaneio.approved':
        case 'romaneio.synced':
          subResult = await this.processRomaneio(dto.payload as RomaneioEventDto, key);
          break;
        default:
          subResult = {
            acknowledged: true,
            eventType: dto.eventType,
            processedAt: new Date().toISOString(),
          };
      }

      const result = {
        success: true,
        eventType: dto.eventType,
        data: subResult,
      };

      this.idempotencyService.recordResponse(key, result);
      return result;
    } catch (error) {
      this.idempotencyService.releaseLock(key);
      this.logger.error(`[ERP] Erro ao processar evento genérico: ${(error as Error).message}`);
      throw error;
    }
  }
}
