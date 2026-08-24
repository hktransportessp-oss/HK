import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
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

  it('deve autorizar requisição com x-hk-key, x-hk-timestamp e x-hk-signature válidos', () => {
    const timestamp = Date.now().toString();
    const body = { settlementCode: 'SETTL-001' };
    const rawBodyStr = JSON.stringify(body);
    const contentToSign = `${timestamp}.${rawBodyStr}`;
    const signature = crypto.createHmac('sha256', mockWebhookSecret).update(contentToSign).digest('hex');

    const context = createMockContext(
      {
        'x-hk-key': mockApiKey,
        'x-hk-timestamp': timestamp,
        'x-hk-signature': signature,
      },
      body,
      Buffer.from(rawBodyStr),
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve autorizar assinatura com prefixo sha256=', () => {
    const timestamp = Date.now().toString();
    const body = { amount: 150.0 };
    const rawBodyStr = JSON.stringify(body);
    const contentToSign = `${timestamp}.${rawBodyStr}`;
    const signature = `sha256=${crypto.createHmac('sha256', mockWebhookSecret).update(contentToSign).digest('hex')}`;

    const context = createMockContext(
      {
        'x-hk-key': mockApiKey,
        'x-hk-timestamp': timestamp,
        'x-hk-signature': signature,
      },
      body,
      Buffer.from(rawBodyStr),
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve rejeitar quando x-hk-key estiver ausente', () => {
    const timestamp = Date.now().toString();
    const context = createMockContext({
      'x-hk-timestamp': timestamp,
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('deve rejeitar quando x-hk-key for incorreto', () => {
    const timestamp = Date.now().toString();
    const context = createMockContext({
      'x-hk-key': 'chave_incorreta_invalida',
      'x-hk-timestamp': timestamp,
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('deve rejeitar quando x-hk-timestamp estiver fora da janela de 5 minutos (expirado no passado)', () => {
    const sixMinutesAgo = (Date.now() - 6 * 60 * 1000).toString();
    const context = createMockContext({
      'x-hk-key': mockApiKey,
      'x-hk-timestamp': sixMinutesAgo,
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('deve rejeitar quando x-hk-timestamp estiver no futuro além de 5 minutos', () => {
    const sixMinutesFuture = (Date.now() + 6 * 60 * 1000).toString();
    const context = createMockContext({
      'x-hk-key': mockApiKey,
      'x-hk-timestamp': sixMinutesFuture,
    });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('deve rejeitar quando assinatura HMAC for inválida', () => {
    const timestamp = Date.now().toString();
    const body = { test: true };
    const invalidSignature = crypto.createHmac('sha256', 'wrong_secret').update('tampered').digest('hex');

    const context = createMockContext(
      {
        'x-hk-key': mockApiKey,
        'x-hk-timestamp': timestamp,
        'x-hk-signature': invalidSignature,
      },
      body,
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
