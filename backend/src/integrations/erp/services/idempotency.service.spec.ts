import { IdempotencyService } from './idempotency.service';

describe('IdempotencyService', () => {
  let service: IdempotencyService;

  beforeEach(() => {
    service = new IdempotencyService();
  });

  it('deve retornar null para chave não processada', () => {
    const cached = service.getProcessedResponse('nova_chave_123');
    expect(cached).toBeNull();
  });

  it('deve registrar e recuperar resposta de requisição idempotente', () => {
    const key = 'req_idempotent_999';
    const responsePayload = { success: true, settlementId: 'settl_123' };

    service.recordResponse(key, responsePayload);

    const replayed = service.getProcessedResponse(key);
    expect(replayed).toBeDefined();
    expect(replayed.success).toBe(true);
    expect(replayed.settlementId).toBe('settl_123');
    expect(replayed.idempotency.replayed).toBe(true);
  });

  it('deve adquirir e liberar lock concorrente para uma chave', () => {
    const key = 'lock_key_456';

    expect(service.acquireLock(key)).toBe(true);
    // Segundo acquire sem liberação deve falhar
    expect(service.acquireLock(key)).toBe(false);

    service.releaseLock(key);
    // Após liberação, deve permitir novo acquire
    expect(service.acquireLock(key)).toBe(true);
  });
});
