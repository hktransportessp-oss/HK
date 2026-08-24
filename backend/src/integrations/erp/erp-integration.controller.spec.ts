import { Test, TestingModule } from '@nestjs/testing';
import { ErpIntegrationController } from './erp-integration.controller';
import { ErpIntegrationService } from './erp-integration.service';
import { IdempotencyService } from './services/idempotency.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ErpIntegrationController', () => {
  let controller: ErpIntegrationController;
  let service: ErpIntegrationService;
  let moduleRef: TestingModule;

  const mockPrismaService = {
    $transaction: jest.fn().mockImplementation(async (callback) => {
      return callback(mockPrismaService);
    }),
    driver: {
      findUnique: jest.fn().mockResolvedValue({ id: 'driver-uuid-1' }),
      findFirst: jest.fn().mockResolvedValue({ id: 'driver-uuid-1' }),
      upsert: jest.fn().mockImplementation((args) => Promise.resolve({ id: args.where.id, status: 'ERP_ONLY' })),
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
    moduleRef = await Test.createTestingModule({
      controllers: [ErpIntegrationController],
      providers: [
        ErpIntegrationService,
        IdempotencyService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = moduleRef.get<ErpIntegrationController>(ErpIntegrationController);
    service = moduleRef.get<ErpIntegrationService>(ErpIntegrationService);
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

  it('POST /settlements deve resolver motorista já existente por ID', async () => {
    mockPrismaService.driver.findUnique.mockResolvedValueOnce({ id: 'driver-existing-id' });

    const webhookEnvelope = {
      idempotencyKey: 'evt_settl_driver_by_id',
      event: 'settlement.created',
      occurredAt: '2026-08-24T10:00:00.000Z',
      data: {
        externalId: 'SETTL-BY-ID-001',
        driver: {
          id: 'driver-existing-id',
          document: '123.456.789-01',
          pix: '12345678901',
        },
        vehicle: { plate: 'ABC1D23' },
        periodStart: '2026-08-01',
        periodEnd: '2026-08-15',
        items: [],
        netAmount: 3000.0,
      },
    };

    const res = await controller.receiveSettlement(webhookEnvelope, 'evt_settl_driver_by_id');
    expect(res.success).toBe(true);
    expect(mockPrismaService.driver.findUnique).toHaveBeenCalledWith({
      where: { id: 'driver-existing-id' },
    });
  });

  it('POST /settlements deve resolver motorista por CPF/documento normalizado', async () => {
    mockPrismaService.driver.findUnique.mockResolvedValueOnce(null);
    mockPrismaService.user.findFirst.mockResolvedValueOnce({
      id: 'user-123',
      cpf: '40279319800',
      driver: { id: 'driver-by-cpf-id' },
    });

    const webhookEnvelope = {
      idempotencyKey: 'evt_settl_driver_by_cpf',
      event: 'settlement.created',
      occurredAt: '2026-08-24T10:00:00.000Z',
      data: {
        externalId: 'SETTL-BY-CPF-001',
        driver: {
          document: '402.793.198-00',
          pix: '40279319800',
        },
        vehicle: { plate: 'ABC1D23' },
        periodStart: '2026-08-01',
        periodEnd: '2026-08-15',
        items: [],
        netAmount: 2500.0,
      },
    };

    const res = await controller.receiveSettlement(webhookEnvelope, 'evt_settl_driver_by_cpf');
    expect(res.success).toBe(true);
  });

  it('POST /settlements deve criar motorista ERP-only deterministicamente quando não existir previamente', async () => {
    mockPrismaService.driver.findUnique.mockResolvedValueOnce(null);
    mockPrismaService.user.findFirst.mockResolvedValueOnce(null);
    mockPrismaService.driver.findFirst.mockResolvedValueOnce(null);

    const erpDriverId = '11111111-1111-4111-8111-111111111111';
    const webhookEnvelope = {
      idempotencyKey: 'evt_settl_driver_erp_only',
      event: 'settlement.created',
      occurredAt: '2026-08-24T10:00:00.000Z',
      data: {
        externalId: 'SETTL-ERP-ONLY-001',
        driver: {
          id: erpDriverId,
          document: '402.793.198.00',
          pix: '40279319800',
        },
        vehicle: { plate: 'ABC1D23' },
        periodStart: '2026-08-01',
        periodEnd: '2026-08-15',
        items: [],
        netAmount: 5000.0,
      },
    };

    const res = await controller.receiveSettlement(webhookEnvelope, 'evt_settl_driver_erp_only');
    expect(res.success).toBe(true);
    expect(mockPrismaService.driver.upsert).toHaveBeenCalledWith({
      where: { id: erpDriverId },
      update: {},
      create: {
        id: erpDriverId,
        userId: null,
        cnh: null,
        cnhCategory: null,
        status: 'ERP_ONLY',
      },
    });
  });

  it('POST /settlements deve retornar 400 se id e document do motorista estiverem ausentes', async () => {
    const webhookEnvelope = {
      idempotencyKey: 'evt_settl_no_driver_info',
      event: 'settlement.created',
      occurredAt: '2026-08-24T10:00:00.000Z',
      data: {
        externalId: 'SETTL-NO-DRIVER-001',
        driver: {} as any,
        vehicle: { plate: 'ABC1D23' },
        periodStart: '2026-08-01',
        periodEnd: '2026-08-15',
        items: [],
        netAmount: 1000.0,
      },
    };

    await expect(
      controller.receiveSettlement(webhookEnvelope, 'evt_settl_no_driver_info'),
    ).rejects.toThrow();
  });

  it('POST /settlements reenvio com mesma chave de idempotência deve retornar resposta em cache', async () => {
    const cachedResponse = {
      success: true,
      event: 'settlement.created',
      settlementCode: 'SETTL-CACHED-001',
    };

    const idempotencyService = moduleRef.get<IdempotencyService>(IdempotencyService);
    jest.spyOn(idempotencyService, 'getProcessedResponse').mockResolvedValueOnce(cachedResponse);

    const webhookEnvelope = {
      idempotencyKey: 'evt_settl_cached_key',
      event: 'settlement.created',
      occurredAt: '2026-08-24T10:00:00.000Z',
      data: {
        externalId: 'SETTL-CACHED-001',
        driver: { id: 'driver-uuid-1', document: '12345678901' },
        vehicle: { plate: 'ABC1D23' },
        periodStart: '2026-08-01',
        periodEnd: '2026-08-15',
        items: [],
        netAmount: 1000.0,
      },
    };

    const res = await controller.receiveSettlement(webhookEnvelope, 'evt_settl_cached_key');
    expect(res).toEqual(cachedResponse);
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
