import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'production'
          ? ['warn', 'error']
          : ['query', 'info', 'warn', 'error'],
      errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
    });
  }

  async onModuleInit() {
    try {
      this.logger.log('Conectando ao banco de dados PostgreSQL...');
      await this.$connect();
      this.logger.log(' Conexão com PostgreSQL estabelecida com sucesso');
    } catch (error) {
      this.logger.error(
        `❌ Falha ao conectar ao banco de dados PostgreSQL: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Encerrando pool de conexões com PostgreSQL...');
    await this.$disconnect();
    this.logger.log(' Pool de conexões do Prisma encerrado com sucesso');
  }
}

