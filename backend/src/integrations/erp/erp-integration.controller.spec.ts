import { Test, TestingModule } from '@nestjs/testing';
import { ErpIntegrationController } from './erp-integration.controller';
import { ErpIntegrationService } from './erp-integration.service';
import { IdempotencyService } from './services/idempotency.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ErpIntegrationController', () => {
  let controller: ErpIntegrationController;
  let service: ErpIntegrationService;

  const mockPrismaService = {
    driver: {
      findUnique: jest.fn().mockResolvedValue({ id: 'driver-uuid-1' }),
      findFirst: jest.fn().mockResolvedValue({ id: 'driver-uuid-1' }),
    },
    user: {
      findFirst: jest.fn().mockResolvedValue({ id: 'user-uuid-1', driver: { id: 'driver-uuid-1' } }),
    },
    trip: {
      findUnique: jest.fn().mockResolvedValue({ id: 'trip-uuid-1' }),
    },
    financialSettlement: {
      upsert: jest.fn().mockResolvedValue({
        id: 'settlement-uuid-1',
        settlementCode: 'SETTL-001',
        status: 'APPROVED',
        netAmount: 4800,
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'settlement-uuid-1',
        settlementCode: 'SETTL-001',
        freightAmount: 4500,
        tollAmount: 300,
        additionalAmount: 0,
        deductionsAmount: 0,
      }),
      update: jest.fn().mockResolvedValue({ id: 'settlement-uuid-1', status: 'PAID' }),
    },
    financialSettlementItem: {
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'item-uuid-1' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    payment: {
      create: jest.fn().mockResolvedValue({
        id: 'payment-uuid-1',
        settlementId: 'settlement-uuid-1',
        amount: 4800,
        status: 'PAID',
        transactionId: 'TX-12345',
      }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    toll: {
      findUnique: jest.fn().mockResolvedValue({ id: 'toll-uuid-1', status: 'PENDING' }),
      update: jest.fn().mockResolvedValue({ id: 'toll-uuid-1', status: 'APPROVED', amount: 50 }),
      create: jest.fn().mockResolvedValue({ id: 'toll-uuid-1', status: 'APPROVED', amount: 50 }),
    },
    tollReceipt: {
      create: jest.fn().mockResolvedValue({ id: 'receipt-uuid-1' }),
    },
    romaneio: {
      upsert: jest.fn().mockResolvedValue({
        id: 'romaneio-uuid-1',
        romaneioCode: 'ROM-001',
        status: 'APPROVED',
      }),
    },
    romaneioDocument: {
      create: jest.fn().mockResolvedValue({ id: 'doc-uuid-1' }),
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

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('POST /settlements deve processar fechamento financeiro', async () => {
    const res = await controller.receiveSettlement({
      settlementCode: 'SETTL-001',
      periodStart: '2026-08-01',
      periodEnd: '2026-08-15',
      freightAmount: 4500,
      tollAmount: 300,
      status: 'APPROVED',
    });

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.settlementCode).toBe('SETTL-001');
  });

  it('POST /payments deve processar confirmação de pagamento', async () => {
    const res = await controller.receivePayment({
      settlementCode: 'SETTL-001',
      amount: 4800,
      paymentMethod: 'PIX',
      transactionId: 'TX-12345',
    });

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.paymentId).toBe('payment-uuid-1');
  });

  it('POST /receipts deve registrar comprovante', async () => {
    const res = await controller.receiveReceipt({
      type: 'TOLL',
      entityId: 'toll-uuid-1',
      fileUrl: 'https://storage.example.com/receipt.pdf',
    });

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.action).toBe('RECEIPT_REGISTERED');
  });

  it('POST /adjustments deve aplicar ajuste financeiro', async () => {
    const res = await controller.receiveAdjustment({
      settlementCode: 'SETTL-001',
      description: 'Bônus Pontualidade',
      type: 'BONUS',
      amount: 200,
    });

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.action).toBe('ADJUSTMENT_APPLIED');
  });

  it('POST /tolls deve sincronizar aprovação de pedágio', async () => {
    const res = await controller.receiveToll({
      tollId: 'toll-uuid-1',
      status: 'APPROVED' as any,
    });

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.status).toBe('APPROVED');
  });

  it('POST /romaneios deve sincronizar romaneio de carga', async () => {
    const res = await controller.receiveRomaneio({
      romaneioCode: 'ROM-001',
      status: 'APPROVED' as any,
    });

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.romaneioCode).toBe('ROM-001');
  });

  it('POST /events deve receber webhook genérico e rotear', async () => {
    const res = await controller.receiveEvent({
      eventType: 'payment.confirmed',
      payload: {
        settlementCode: 'SETTL-001',
        amount: 4800,
        paymentMethod: 'PIX',
      },
    });

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.eventType).toBe('payment.confirmed');
  });
});
