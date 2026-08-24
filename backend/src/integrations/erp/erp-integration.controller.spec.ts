import { Test, TestingModule } from '@nestjs/testing';
import { ErpIntegrationController } from './erp-integration.controller';
import { ErpIntegrationService } from './erp-integration.service';
import { IdempotencyService } from './services/idempotency.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ErpIntegrationController', () => {
  let controller: ErpIntegrationController;
  let service: ErpIntegrationService;

  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(mockPrismaService);
    }),
    driver: {
      findUnique: jest.fn().mockResolvedValue({ id: 'driver-uuid-1' }),
      findFirst: jest.fn().mockResolvedValue({ id: 'driver-uuid-1' }),
    },
    user: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'user-uuid-1',
        cpf: '12345678901',
        driver: { id: 'driver-uuid-1' },
      }),
    },
    trip: {
      findUnique: jest.fn().mockResolvedValue({ id: 'trip-uuid-1' }),
    },
    financialSettlement: {
      upsert: jest.fn().mockResolvedValue({
        id: 'settlement-uuid-1',
        settlementCode: 'SETTL-2026-08-001',
        status: 'APPROVED',
        netAmount: 4450.0,
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'settlement-uuid-1',
        settlementCode: 'SETTL-2026-08-001',
        netAmount: 4450.0,
      }),
      findFirst: jest.fn().mockResolvedValue({
        id: 'settlement-uuid-1',
        settlementCode: 'SETTL-2026-08-001',
        netAmount: 4450.0,
      }),
      update: jest.fn().mockResolvedValue({ id: 'settlement-uuid-1', status: 'PAID' }),
    },
    financialSettlementItem: {
      deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
      createMany: jest.fn().mockResolvedValue({ count: 3 }),
      create: jest.fn().mockResolvedValue({ id: 'item-uuid-1', amount: 250.0 }),
      findMany: jest.fn().mockResolvedValue([
        { type: 'FREIGHT', amount: 4500 },
        { type: 'BONUS', amount: 250 },
      ]),
    },
    payment: {
      create: jest.fn().mockResolvedValue({
        id: 'payment-uuid-1',
        settlementId: 'settlement-uuid-1',
        amount: 4450.0,
        status: 'PAID',
        transactionId: 'TX-PIX-998811',
      }),
    },
    toll: {
      findUnique: jest.fn().mockResolvedValue({ id: 'toll-uuid-1', status: 'PENDING' }),
      update: jest.fn().mockResolvedValue({ id: 'toll-uuid-1', status: 'APPROVED' }),
      create: jest.fn().mockResolvedValue({ id: 'toll-uuid-1', amount: 42.8, status: 'APPROVED' }),
    },
    romaneio: {
      upsert: jest.fn().mockResolvedValue({ id: 'rom-uuid-1', romaneioCode: 'ROM-123', status: 'APPROVED' }),
    },
    romaneioDocument: {
      create: jest.fn().mockResolvedValue({ id: 'doc-uuid-1' }),
    },
    idempotencyRecord: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({ id: 'idemp-1' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ErpIntegrationController],
      providers: [
        ErpIntegrationService,
        IdempotencyService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<ErpIntegrationController>(ErpIntegrationController);
    service = module.get<ErpIntegrationService>(ErpIntegrationService);
  });

  it('deve estar definido com todas as 7 rotas', () => {
    expect(controller).toBeDefined();
    expect(controller.receiveSettlement).toBeDefined();
    expect(controller.receivePayment).toBeDefined();
    expect(controller.receiveReceipt).toBeDefined();
    expect(controller.receiveAdjustment).toBeDefined();
    expect(controller.receiveToll).toBeDefined();
    expect(controller.receiveRomaneio).toBeDefined();
    expect(controller.receiveEvent).toBeDefined();
  });

  it('POST /settlements deve processar envelope com driver { id, document, pix }', async () => {
    const webhookEnvelope = {
      idempotencyKey: 'evt_settl_982173491823',
      event: 'settlement.created',
      occurredAt: '2026-08-24T10:00:00.000Z',
      data: {
        externalId: 'SETTL-2026-08-001',
        externalSource: 'HK_ERP',
        driver: {
          id: 'driver-uuid-1',
          document: '123.456.789-01',
          pix: '12345678901',
        },
        vehicle: {
          plate: 'ABC1D23',
          description: 'Scania R450 - Cavalo Mecânico',
        },
        periodStart: '2026-08-01',
        periodEnd: '2026-08-15',
        dueDate: '2026-08-20',
        status: 'APPROVED',
        items: [
          { externalId: 'ITEM-001', description: 'Frete Viagem SP -> RJ', type: 'FREIGHT', amount: 4500.0 },
          { externalId: 'ITEM-002', description: 'Reembolso Pedágio', type: 'TOLL', amount: 350.0 },
          { externalId: 'ITEM-003', description: 'Abastecimento Convênio', type: 'DISCOUNT', amount: 400.0 },
        ],
        grossAmount: 4850.0,
        discountAmount: 400.0,
        netAmount: 4450.0,
        paidAmount: 0.0,
        version: 1,
      },
    };

    const res = await controller.receiveSettlement(
      webhookEnvelope,
      'evt_settl_982173491823',
    );

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.event).toBe('settlement.created');
    expect(res.settlementCode).toBe('SETTL-2026-08-001');
    expect(res.netAmount).toBe(4450.0);
  });

  it('deve REJEITAR deterministicamente se o motorista não for localizado por document/id', async () => {
    mockPrismaService.user.findFirst.mockResolvedValueOnce(null);
    mockPrismaService.driver.findUnique.mockResolvedValueOnce(null);
    mockPrismaService.driver.findFirst.mockResolvedValueOnce(null);

    const webhookEnvelope = {
      idempotencyKey: 'evt_settl_invalid_driver',
      event: 'settlement.created',
      occurredAt: '2026-08-24T10:00:00.000Z',
      data: {
        externalId: 'SETTL-999',
        driver: { document: '000.000.000-00', pix: '000' },
        periodStart: '2026-08-01',
        periodEnd: '2026-08-15',
        items: [],
        netAmount: 1000.0,
      },
    };

    await expect(
      controller.receiveSettlement(webhookEnvelope, 'evt_settl_invalid_driver'),
    ).rejects.toThrow(NotFoundException);
  });

  it('POST /payments deve processar evento com settlementId e proofUrl', async () => {
    const webhookEnvelope = {
      idempotencyKey: 'evt_pay_99210',
      event: 'payment.confirmed',
      occurredAt: '2026-08-24T10:00:00.000Z',
      data: {
        externalId: 'PAY-2026-08-001',
        settlementId: 'SETTL-2026-08-001',
        amount: 4450.0,
        method: 'PIX',
        paidAt: '2026-08-24T10:00:00.000Z',
        proofUrl: 'https://storage.hktransportes.com.br/receipts/pix.pdf',
        status: 'PAID',
        transactionId: 'TX-PIX-998811',
      },
    };

    const res = await controller.receivePayment(
      webhookEnvelope,
      'evt_pay_99210',
    );

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.action).toBe('PAYMENT_RECORDED');
    expect(res.settlementCode).toBe('SETTL-2026-08-001');
  });

  it('POST /receipts deve processar comprovante e atualizar entidade', async () => {
    const webhookEnvelope = {
      idempotencyKey: 'evt_rcp_001',
      event: 'receipt.verified',
      occurredAt: '2026-08-24T10:00:00.000Z',
      data: {
        externalId: 'RCP-001',
        type: 'TOLL',
        entityId: 'toll-uuid-1',
        fileUrl: 'https://storage.hktransportes.com.br/receipts/toll.jpg',
        status: 'VERIFIED',
      },
    };

    const res = await controller.receiveReceipt(
      webhookEnvelope,
      'evt_rcp_001',
    );

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.action).toBe('RECEIPT_PROCESSED');
  });

  it('POST /adjustments deve processar ajuste financeiro e recalcular saldo', async () => {
    const webhookEnvelope = {
      idempotencyKey: 'evt_adj_001',
      event: 'adjustment.created',
      occurredAt: '2026-08-24T10:00:00.000Z',
      data: {
        externalId: 'ADJ-001',
        settlementId: 'SETTL-2026-08-001',
        description: 'Bônus de Viagem',
        type: 'BONUS',
        amount: 250.0,
      },
    };

    const res = await controller.receiveAdjustment(
      webhookEnvelope,
      'evt_adj_001',
    );

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.action).toBe('ADJUSTMENT_RECORDED');
  });
});
