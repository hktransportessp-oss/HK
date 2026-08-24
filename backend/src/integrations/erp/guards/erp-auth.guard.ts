import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
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

    // 1. Obter headers de autenticação e integridade da integração HK ERP
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

    const webhookSecret =
      process.env.ERP_WEBHOOK_SECRET ||
      expectedApiKey ||
      '';

    // 2. Validação da Chave de API (x-hk-key)
    if (!apiKey) {
      this.logger.warn('Rejeitado: Header x-hk-key ausente na requisição do ERP');
      throw new UnauthorizedException('Header x-hk-key ausente na requisição');
    }

    if (expectedApiKey) {
      const apiKeyBuffer = Buffer.from(apiKey);
      const expectedBuffer = Buffer.from(expectedApiKey);

      if (
        apiKeyBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(apiKeyBuffer, expectedBuffer)
      ) {
        this.logger.warn('Rejeitado: x-hk-key inválido');
        throw new UnauthorizedException('Chave de integração x-hk-key inválida');
      }
    }

    // 3. Validação de Janela Temporal de 5 Minutos (x-hk-timestamp)
    if (!timestampHeader) {
      this.logger.warn('Rejeitado: Header x-hk-timestamp ausente');
      throw new UnauthorizedException('Header x-hk-timestamp ausente na requisição');
    }

    let timestampMs: number;
    if (/^\d+$/.test(timestampHeader)) {
      const num = parseInt(timestampHeader, 10);
      // Se enviado em segundos (10 dígitos), converter para milissegundos
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
        `Rejeitado: Timestamp fora da janela de 5 minutos (drift: ${Math.round(drift / 1000)}s)`,
      );
      throw new UnauthorizedException(
        `Timestamp de integração expirado ou fora da tolerância de 5 minutos (drift: ${Math.round(drift / 1000)}s)`,
      );
    }

    // 4. Validação Criptográfica Timing-Safe de Assinatura HMAC-SHA256 (x-hk-signature)
    if (signature && webhookSecret) {
      // Obter rawBody se disponível pelo NestJS ou serializar body
      let rawPayload = '';
      if (request.rawBody && Buffer.isBuffer(request.rawBody)) {
        rawPayload = request.rawBody.toString('utf-8');
      } else if (typeof request.body === 'string') {
        rawPayload = request.body;
      } else if (request.body) {
        rawPayload = JSON.stringify(request.body);
      }

      // Conteúdo assinado: "<timestamp>.<corpo bruto>"
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
        this.logger.warn('Rejeitado: Assinatura HMAC-SHA256 inválida');
        throw new UnauthorizedException('Assinatura HMAC x-hk-signature inválida');
      }
    }

    return true;
  }
}
