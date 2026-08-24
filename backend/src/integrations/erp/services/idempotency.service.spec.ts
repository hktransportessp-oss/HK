import { IdempotencyService } from './idempotency.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('IdempotencyService (PostgreSQL Persistence)', () => {
  let service: IdempotencyService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      idempotencyRecord: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };
    service = new IdempotencyService(mockPrisma as unknown as PrismaService);
  });

  it('deve retornar null para chave não processada no banco', async () => {
    mockPrisma.idempotencyRecord.findUnique.mockResolvedValue(null);

    const cached = await service.getProcessedResponse('chave_inexistente');
    expect(cached).toBeNull();
    expect(mockPrisma.idempotencyRecord.findUnique).toHaveBeenCalledWith({
      where: { key: 'chave_inexistente' },
    });
  });

  it('deve retornar resposta persistida em cache e marcar replayed = true', async () => {
    const key = 'evt_settl_982173491823';
    const originalPayload = { success: true, settlementId: 'settl-123' };

    mockPrisma.idempotencyRecord.findUnique.mockResolvedValue({
      id: 'uuid-1',
      key,
      response: JSON.stringify(originalPayload),
      createdAt: new Date('2026-08-24T10:00:00.000Z'),
    });

    const result = await service.getProcessedResponse(key);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.settlementId).toBe('settl-123');
    expect(result.idempotency.replayed).toBe(true);
  });

  it('deve persistir no banco de dados via upsert', async () => {
    const key = 'evt_settl_982173491823';
    const payload = { success: true, settlementId: 'settl-123' };

    mockPrisma.idempotencyRecord.upsert.mockResolvedValue({ id: 'uuid-1', key });

    await service.recordResponse(key, payload, '/api/v1/integrations/erp/settlements');

    expect(mockPrisma.idempotencyRecord.upsert).toHaveBeenCalledWith({
      where: { key },
      update: expect.objectContaining({
        endpoint: '/api/v1/integrations/erp/settlements',
      }),
      create: expect.objectContaining({
        key,
        endpoint: '/api/v1/integrations/erp/settlements',
      }),
    });
  });
});
