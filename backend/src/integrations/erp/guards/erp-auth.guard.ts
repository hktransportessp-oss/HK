import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ErpAuthGuard implements CanActivate {
  private readonly logger = new Logger(ErpAuthGuard.name);
  private readonly FIVE_MINUTES_MS = 5 * 60 * 1000; // 300,000 ms

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;

    // 1. Obter headers de autenticação e integridade do HK ERP
    const apiKey =
      (headers['x-hk-key'] as string) ||
      (headers['x-api-key'] as string) ||
      (headers['x-hk-api-key'] as string);

    const timestampHeader =
      (headers['x-hk-timestamp'] as string) ||
      (headers['x-timestamp'] as string);

    const signature =
      (headers['x-hk-signature'] as string) ||
      (headers['x-signature'] as string);

    const expectedApiKey =
      process.env.ERP_API_KEY ||
      process.env.HK_ERP_API_KEY ||
      '';

    const webhookSecret = process.env.ERP_WEBHOOK_SECRET || '';

    // 2. Validação Obrigatória da Chave de API (x-hk-key)
    if (!apiKey) {
      this.logger.warn('Rejeitado: Header x-hk-key ausente na requisição');
      throw new UnauthorizedException('Header x-hk-key obrigatório ausente na requisição');
    }

    if (!expectedApiKey) {
      this.logger.error('Rejeitado: ERP_API_KEY não configurada no servidor');
      throw new UnauthorizedException('Serviço de integração não configurado no servidor');
    }

    const apiKeyBuffer = Buffer.from(apiKey);
    const expectedBuffer = Buffer.from(expectedApiKey);

    if (
      apiKeyBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(apiKeyBuffer, expectedBuffer)
    ) {
      this.logger.warn('Rejeitado: x-hk-key inválido');
      throw new UnauthorizedException('Chave de integração x-hk-key inválida');
    }

    // 3. Validação Obrigatória de Janela Temporal de 5 Minutos (x-hk-timestamp)
    if (!timestampHeader) {
      this.logger.warn('Rejeitado: Header x-hk-timestamp ausente');
      throw new UnauthorizedException('Header x-hk-timestamp obrigatório ausente na requisição');
    }

    let timestampMs: number;
    if (/^\d+$/.test(timestampHeader)) {
      const num = parseInt(timestampHeader, 10);
      timestampMs = num < 1e11 ? num * 1000 : num;
    } else {
      timestampMs = new Date(timestampHeader).getTime();
    }

    if (isNaN(timestampMs)) {
      this.logger.warn(`Rejeitado: Formato de timestamp inválido: ${timestampHeader}`);
      throw new UnauthorizedException('Formato do header x-hk-timestamp inválido');
    }

    const now = Date.now();
    const drift = Math.abs(now - timestampMs);

    if (drift > this.FIVE_MINUTES_MS) {
      this.logger.warn(
        `Rejeitado: Timestamp fora da tolerância de 5 minutos (drift: ${Math.round(drift / 1000)}s)`,
      );
      throw new UnauthorizedException(
        `Timestamp de integração expirado ou fora da tolerância de 5 minutos (drift: ${Math.round(drift / 1000)}s)`,
      );
    }

    // 4. Validação Obrigatória da Assinatura Criptográfica HMAC-SHA256 (x-hk-signature)
    if (!signature) {
      this.logger.warn('Rejeitado: Header x-hk-signature ausente (assinatura HMAC é obrigatória)');
      throw new UnauthorizedException('Header x-hk-signature obrigatório ausente');
    }

    if (!webhookSecret) {
      this.logger.error('Rejeitado: ERP_WEBHOOK_SECRET não configurado no servidor');
      throw new UnauthorizedException('Chave secreta de Webhook ERP não configurada no servidor');
    }

    // Obter rawBody exato preservado pelo NestJS ou serializar fallback
    let rawPayload = '';
    if (request.rawBody && Buffer.isBuffer(request.rawBody)) {
      rawPayload = request.rawBody.toString('utf-8');
    } else if (typeof request.body === 'string') {
      rawPayload = request.body;
    } else if (request.body) {
      rawPayload = JSON.stringify(request.body);
    }

    // Conteúdo a assinar: "<timestamp>.<raw payload recebido>"
    const contentToSign = `${timestampHeader}.${rawPayload}`;
    const calculatedHmac = crypto
      .createHmac('sha256', webhookSecret)
      .update(contentToSign)
      .digest('hex');

    const cleanSignature = signature.startsWith('sha256=')
      ? signature.slice(7)
      : signature;

    const sigBuffer = Buffer.from(cleanSignature, 'hex');
    const calcBuffer = Buffer.from(calculatedHmac, 'hex');

    if (
      sigBuffer.length !== calcBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, calcBuffer)
    ) {
      this.logger.warn('Rejeitado: Assinatura HMAC x-hk-signature inválida');
      throw new UnauthorizedException('Assinatura HMAC x-hk-signature inválida');
    }

    // 5. Validação de consistência do Header idempotency-key e body.idempotencyKey
    const httpIdempotencyHeader =
      (headers['idempotency-key'] as string) ||
      (headers['x-idempotency-key'] as string);

    const bodyIdempotencyKey = request.body?.idempotencyKey;

    if (!httpIdempotencyHeader && !bodyIdempotencyKey) {
      this.logger.warn('Rejeitado: Chave de idempotência ausente no header e no body');
      throw new BadRequestException('idempotency-key é obrigatório no header HTTP ou no corpo da requisição');
    }

    if (
      httpIdempotencyHeader &&
      bodyIdempotencyKey &&
      httpIdempotencyHeader !== bodyIdempotencyKey
    ) {
      this.logger.warn(
        `Rejeitado: Inconsistência entre header idempotency-key ("${httpIdempotencyHeader}") e body.idempotencyKey ("${bodyIdempotencyKey}")`,
      );
      throw new BadRequestException(
        'Inconsistência detectada entre o header idempotency-key e o campo body.idempotencyKey',
      );
    }

    return true;
  }
}
