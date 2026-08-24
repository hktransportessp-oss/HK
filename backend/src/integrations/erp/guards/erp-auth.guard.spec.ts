import { ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ErpAuthGuard } from './erp-auth.guard';
import * as crypto from 'crypto';

describe('ErpAuthGuard', () => {
  let guard: ErpAuthGuard;
  const mockApiKey = 'test_secret_erp_key_12345';
  const mockWebhookSecret = 'test_webhook_secret_67890';

  beforeEach(() => {
    process.env.ERP_API_KEY = mockApiKey;
    process.env.ERP_WEBHOOK_SECRET = mockWebhookSecret;
    guard = new ErpAuthGuard();
  });

  afterEach(() => {
    delete process.env.ERP_API_KEY;
    delete process.env.ERP_WEBHOOK_SECRET;
  });

  function createMockContext(headers: Record<string, string>, body: any = {}, rawBody?: Buffer): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
          body,
          rawBody: rawBody || Buffer.from(JSON.stringify(body)),
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('deve autorizar requisição com x-hk-key, x-hk-timestamp, x-hk-signature e idempotency-key válidos', () => {
    const timestamp = Date.now().toString();
    const body = {
      idempotencyKey: 'evt_settl_982173491823',
      event: 'settlement.created',
      occurredAt: '2026-08-24T10:00:00.000Z',
      data: {
        externalId: 'SETTL-2026-08-001',
        externalSource: 'HK_ERP',
        driver: { cpf: '12345678901', name: 'João da Silva' },
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

    const rawBodyStr = JSON.stringify(body);
    const contentToSign = `${timestamp}.${rawBodyStr}`;
    const signature = crypto.createHmac('sha256', mockWebhookSecret).update(contentToSign).digest('hex');

    const context = createMockContext(
      {
        'x-hk-key': mockApiKey,
        'x-hk-timestamp': timestamp,
        'x-hk-signature': signature,
        'idempotency-key': 'evt_settl_982173491823',
      },
      body,
      Buffer.from(rawBodyStr),
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve rejeitar com 401 quando x-hk-signature estiver ausente (mesmo com x-hk-key válida)', () => {
    const timestamp = Date.now().toString();
    const body = { idempotencyKey: 'evt_123', event: 'test' };

    const context = createMockContext(
      {
        'x-hk-key': mockApiKey,
        'x-hk-timestamp': timestamp,
        'idempotency-key': 'evt_123',
      },
      body,
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('deve rejeitar com 401 quando x-hk-key for incorreta', () => {
    const timestamp = Date.now().toString();
    const body = { idempotencyKey: 'evt_123' };
    const contentToSign = `${timestamp}.${JSON.stringify(body)}`;
    const signature = crypto.createHmac('sha256', mockWebhookSecret).update(contentToSign).digest('hex');

    const context = createMockContext(
      {
        'x-hk-key': 'chave_errada',
        'x-hk-timestamp': timestamp,
        'x-hk-signature': signature,
        'idempotency-key': 'evt_123',
      },
      body,
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('deve rejeitar com 401 quando timestamp estiver fora da tolerância de 5 minutos', () => {
    const sixMinutesAgo = (Date.now() - 6 * 60 * 1000).toString();
    const body = { idempotencyKey: 'evt_123' };
    const contentToSign = `${sixMinutesAgo}.${JSON.stringify(body)}`;
    const signature = crypto.createHmac('sha256', mockWebhookSecret).update(contentToSign).digest('hex');

    const context = createMockContext(
      {
        'x-hk-key': mockApiKey,
        'x-hk-timestamp': sixMinutesAgo,
        'x-hk-signature': signature,
        'idempotency-key': 'evt_123',
      },
      body,
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('deve rejeitar com 400 se houver divergência entre header idempotency-key e body.idempotencyKey', () => {
    const timestamp = Date.now().toString();
    const body = { idempotencyKey: 'key_no_body' };
    const rawBodyStr = JSON.stringify(body);
    const contentToSign = `${timestamp}.${rawBodyStr}`;
    const signature = crypto.createHmac('sha256', mockWebhookSecret).update(contentToSign).digest('hex');

    const context = createMockContext(
      {
        'x-hk-key': mockApiKey,
        'x-hk-timestamp': timestamp,
        'x-hk-signature': signature,
        'idempotency-key': 'key_diferente_no_header',
      },
      body,
      Buffer.from(rawBodyStr),
    );

    expect(() => guard.canActivate(context)).toThrow(BadRequestException);
  });
});
