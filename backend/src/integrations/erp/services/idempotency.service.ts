import { Injectable, Logger } from '@nestjs/common';

export interface IdempotencyRecord {
  key: string;
  response: any;
  createdAt: number;
}

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly store = new Map<string, IdempotencyRecord>();
  private readonly inFlight = new Set<string>();
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

  constructor() {
    // Limpeza periódica de chaves expiradas a cada 1 hora
    setInterval(() => this.cleanup(), 60 * 60 * 1000).unref();
  }

  /**
   * Verifica se uma requisição com esta chave já foi processada.
   * Se já processada, retorna o resultado cacheado para evitar efeitos colaterais duplicados.
   */
  getProcessedResponse(key: string): any | null {
    if (!key) return null;
    const record = this.store.get(key);
    if (!record) return null;

    if (Date.now() - record.createdAt > this.TTL_MS) {
      this.store.delete(key);
      return null;
    }

    this.logger.log(`[Idempotência] Reenvio detectado para a chave '${key}'. Retornando resposta em cache.`);
    return {
      ...record.response,
      idempotency: {
        replayed: true,
        originalCreatedAt: new Date(record.createdAt).toISOString(),
      },
    };
  }

  /**
   * Registra a resposta com sucesso vinculada à chave de idempotência.
   */
  recordResponse(key: string, response: any): void {
    if (!key) return;
    this.store.set(key, {
      key,
      response,
      createdAt: Date.now(),
    });
    this.inFlight.delete(key);
  }

  /**
   * Bloqueia execução concorrente da mesma chave
   */
  acquireLock(key: string): boolean {
    if (!key) return true;
    if (this.inFlight.has(key)) {
      return false;
    }
    this.inFlight.add(key);
    return true;
  }

  /**
   * Libera bloqueio em caso de falha
   */
  releaseLock(key: string): void {
    if (key) {
      this.inFlight.delete(key);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now - record.createdAt > this.TTL_MS) {
        this.store.delete(key);
      }
    }
  }
}
