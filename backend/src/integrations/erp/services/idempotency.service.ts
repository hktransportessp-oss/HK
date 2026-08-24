import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca registro de idempotência persistido no PostgreSQL.
   * Se já processada, retorna o resultado salvo para garantir replays seguros entre réplicas e reinicializações.
   */
  async getProcessedResponse(key: string): Promise<any | null> {
    if (!key) return null;

    try {
      const record = await this.prisma.idempotencyRecord.findUnique({
        where: { key },
      });

      if (!record) return null;

      this.logger.log(`[Idempotência PostgreSQL] Replay detectado para a chave '${key}'.`);
      const parsedResponse = JSON.parse(record.response);

      return {
        ...parsedResponse,
        idempotency: {
          replayed: true,
          originalCreatedAt: record.createdAt.toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Erro ao consultar registro de idempotência para ${key}: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Salva atomicamente no PostgreSQL o registro de idempotência.
   * Se for executado dentro de uma transação Prisma, pode reutilizar o tx client.
   */
  async recordResponse(
    key: string,
    response: any,
    endpoint?: string,
    prismaClient?: any,
  ): Promise<void> {
    if (!key) return;

    const db = prismaClient || this.prisma;
    const serializedResponse = JSON.stringify(response);

    try {
      await db.idempotencyRecord.upsert({
        where: { key },
        update: {
          response: serializedResponse,
          endpoint: endpoint || null,
          updatedAt: new Date(),
        },
        create: {
          key,
          endpoint: endpoint || null,
          response: serializedResponse,
        },
      });
      this.logger.log(`[Idempotência PostgreSQL] Chave '${key}' registrada com sucesso.`);
    } catch (error) {
      this.logger.error(`Erro ao salvar idempotency key ${key}: ${(error as Error).message}`);
    }
  }
}
