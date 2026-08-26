import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

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
      await this.ensureAdminBootstrap();
    } catch (error) {
      this.logger.error(
        `❌ Falha ao conectar ao banco de dados PostgreSQL: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  private async ensureAdminBootstrap() {
    try {
      const adminCpf = '40279319800';
      const adminPassword = '1992125223';
      const adminPasswordHash = await argon2.hash(adminPassword, {
        type: argon2.argon2id,
      });

      const existingAdmin = await this.user.findFirst({
        where: {
          OR: [{ cpf: adminCpf }, { cpf: '402.793.198-00' }],
        },
      });

      if (!existingAdmin) {
        await this.user.create({
          data: {
            name: 'Everton',
            cpf: adminCpf,
            role: 'ADMIN',
            status: 'ACTIVE',
            passwordHash: adminPasswordHash,
          },
        });
        this.logger.log('Usuário ADMIN (Everton) criado automaticamente no banco de dados.');
      } else {
        await this.user.update({
          where: { id: existingAdmin.id },
          data: {
            name: 'Everton',
            cpf: adminCpf,
            role: 'ADMIN',
            status: 'ACTIVE',
            passwordHash: adminPasswordHash,
          },
        });
        this.logger.log('Usuário ADMIN (Everton) verificado e sincronizado com sucesso.');
      }
    } catch (error) {
      this.logger.warn(
        `Aviso ao verificar usuário admin inicial: ${(error as Error).message}`,
      );
    }
  }

  async onModuleDestroy() {
    this.logger.log('Encerrando pool de conexões com PostgreSQL...');
    await this.$disconnect();
    this.logger.log(' Pool de conexões do Prisma encerrado com sucesso');
  }
}

