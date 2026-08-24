import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ErpIntegrationController } from './erp-integration.controller';
import { ErpIntegrationService } from './erp-integration.service';
import { IdempotencyService } from './services/idempotency.service';
import { ErpAuthGuard } from './guards/erp-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ErpIntegrationController],
  providers: [ErpIntegrationService, IdempotencyService, ErpAuthGuard],
  exports: [ErpIntegrationService, IdempotencyService],
})
export class ErpIntegrationModule {}
