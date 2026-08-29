import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { ErpIntegrationService } from './erp-integration.service';
import { ErpAuthGuard } from './guards/erp-auth.guard';
import {
  ErpSettlementWebhookDto,
} from './dto/erp-webhook-envelope.dto';
import {
  ErpPaymentWebhookDto,
} from './dto/payment-payload.dto';
import {
  ErpReceiptWebhookDto,
} from './dto/receipt-payload.dto';
import {
  ErpAdjustmentWebhookDto,
} from './dto/adjustment-payload.dto';
import { TollEventDto } from './dto/toll-event.dto';
import { RomaneioEventDto } from './dto/romaneio-event.dto';
import { ErpInvoiceSyncDto } from './dto/invoice-payload.dto';

@ApiTags('ERP Integrations')
@ApiHeader({
  name: 'x-hk-key',
  description: 'Chave de API do ERP Financeiro para autenticação (ERP_API_KEY)',
  required: true,
})
@ApiHeader({
  name: 'x-hk-timestamp',
  description: 'Timestamp Unix (ms ou s) da requisição para prevenção de replay attacks (máx 5min)',
  required: true,
})
@ApiHeader({
  name: 'x-hk-signature',
  description: 'Assinatura HMAC-SHA256 do conteúdo "<timestamp>.<raw_body>" com ERP_WEBHOOK_SECRET',
  required: true,
})
@ApiHeader({
  name: 'idempotency-key',
  description: 'Chave de idempotência única para prevenir execuções duplicadas',
  required: true,
})
@UseGuards(ErpAuthGuard)
@Controller('api/v1/integrations/erp')
export class ErpIntegrationController {
  constructor(private readonly erpService: ErpIntegrationService) {}

  /**
   * 1. POST /api/v1/integrations/erp/settlements
   */
  @Post('settlements')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe eventos settlement.created e settlement.updated do ERP',
    description: 'Processa transacionalmente o fechamento financeiro com base no envelope oficial do HK ERP.',
  })
  @ApiResponse({ status: 200, description: 'Fechamento financeiro processado e persistido com sucesso' })
  async receiveSettlement(
    @Body() envelope: ErpSettlementWebhookDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || envelope.idempotencyKey;
    if (!key) {
      throw new BadRequestException('idempotency-key é obrigatório no header HTTP ou no corpo da requisição');
    }
    return this.erpService.processSettlementEvent(envelope, key);
  }

  /**
   * 2. POST /api/v1/integrations/erp/payments
   */
  @Post('payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe eventos payment.confirmed do ERP',
    description: 'Registra comprovantes, transações PIX/TED e atualiza status do fechamento financeiro.',
  })
  @ApiResponse({ status: 200, description: 'Pagamento registrado com sucesso' })
  async receivePayment(
    @Body() envelope: ErpPaymentWebhookDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || envelope.idempotencyKey;
    if (!key) {
      throw new BadRequestException('idempotency-key é obrigatório no header HTTP ou no corpo da requisição');
    }
    return this.erpService.processPaymentEvent(envelope, key);
  }

  /**
   * 3. POST /api/v1/integrations/erp/receipts
   */
  @Post('receipts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe comprovantes e recibos validados pelo ERP (pedágio, despesas, etc.)',
    description: 'Vincula comprovantes de pedágio e abastecimento às entidades correspondentes no HK Central.',
  })
  @ApiResponse({ status: 200, description: 'Comprovante processado com sucesso' })
  async receiveReceipt(
    @Body() envelope: ErpReceiptWebhookDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || envelope.idempotencyKey;
    if (!key) {
      throw new BadRequestException('idempotency-key é obrigatório no header HTTP ou no corpo da requisição');
    }
    return this.erpService.processReceiptEvent(envelope, key);
  }

  /**
   * 4. POST /api/v1/integrations/erp/adjustments
   */
  @Post('adjustments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe eventos adjustment.created (bônus, descontos, acréscimos) do ERP',
    description: 'Aplica ajustes discriminados ao fechamento e recalcula o montante líquido.',
  })
  @ApiResponse({ status: 200, description: 'Ajuste financeiro processado com sucesso' })
  async receiveAdjustment(
    @Body() envelope: ErpAdjustmentWebhookDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || envelope.idempotencyKey;
    if (!key) {
      throw new BadRequestException('idempotency-key é obrigatório no header HTTP ou no corpo da requisição');
    }
    return this.erpService.processAdjustmentEvent(envelope, key);
  }

  /**
   * 5. POST /api/v1/integrations/erp/tolls
   */
  @Post('tolls')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sincroniza aprovações e reembolsos de comprovantes de pedágio do ERP',
  })
  @ApiResponse({ status: 200, description: 'Pedágio atualizado com sucesso' })
  async receiveToll(
    @Body() dto: TollEventDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || dto.idempotencyKey;
    if (!key) {
      throw new BadRequestException('idempotency-key é obrigatório no header HTTP ou no corpo da requisição');
    }
    return this.erpService.processTollEvent(dto, key);
  }

  /**
   * 6. POST /api/v1/integrations/erp/romaneios
   */
  @Post('romaneios')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sincroniza manifestos e romaneios de carga validados pelo ERP',
  })
  @ApiResponse({ status: 200, description: 'Romaneio sincronizado com sucesso' })
  async receiveRomaneio(
    @Body() dto: RomaneioEventDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || dto.idempotencyKey;
    if (!key) {
      throw new BadRequestException('idempotency-key é obrigatório no header HTTP ou no corpo da requisição');
    }
    return this.erpService.processRomaneioEvent(dto, key);
  }

  /**
   * 7. POST /api/v1/integrations/erp/invoices
   */
  @Post('invoices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe e sincroniza Notas Fiscais eletrônicas emitidas/importadas pelo ERP',
    description: 'Importa NF-e individuais ou lotes diretamente do ERP para disponibilização no painel operacional HK Connect.',
  })
  @ApiResponse({ status: 200, description: 'Nota(s) Fiscal(is) sincronizada(s) com sucesso' })
  async receiveInvoice(
    @Body() dto: ErpInvoiceSyncDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || dto.idempotencyKey;
    if (!key) {
      throw new BadRequestException('idempotency-key é obrigatório no header HTTP ou no corpo da requisição');
    }
    return this.erpService.processInvoiceEvent(dto, key);
  }

  /**
   * 8. POST /api/v1/integrations/erp/invoices/sync (ou /backfill)
   */
  @Post('invoices/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sincronização em lote / Backfill de Notas Fiscais históricas do ERP',
  })
  @ApiResponse({ status: 200, description: 'Sincronização em lote processada' })
  async syncInvoices(
    @Body() dto: ErpInvoiceSyncDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || dto.idempotencyKey;
    return this.erpService.syncInvoicesBackfill(dto, key);
  }

  @Post('invoices/backfill')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Backfill e reconciliação inicial de Notas Fiscais do ERP',
  })
  async backfillInvoices(
    @Body() dto: ErpInvoiceSyncDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || dto.idempotencyKey;
    return this.erpService.syncInvoicesBackfill(dto, key);
  }

  /**
   * 9. POST /api/v1/integrations/erp/events
   */
  @Post('events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receptor central de Webhooks e eventos assíncronos do ecossistema ERP',
  })
  @ApiResponse({ status: 200, description: 'Evento aceito e processado com sucesso' })
  async receiveEvent(
    @Body() envelope: any,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || envelope.idempotencyKey;
    if (!key) {
      throw new BadRequestException('idempotency-key é obrigatório no header HTTP ou no corpo da requisição');
    }
    return this.erpService.processGenericEvent(envelope, key);
  }
}
