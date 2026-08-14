import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { ErpIntegrationService } from '../common/services/erp-integration.service';

@Module({
  controllers: [InvoicesController],
  providers: [InvoicesService, ErpIntegrationService],
  exports: [InvoicesService, ErpIntegrationService],
})
export class InvoicesModule {}
