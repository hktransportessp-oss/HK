import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { ErpIntegrationService } from './erp-integration.service';
import { ErpAuthGuard } from './guards/erp-auth.guard';
import { SettlementEventDto } from './dto/settlement-event.dto';
import { PaymentEventDto } from './dto/payment-event.dto';
import { ReceiptEventDto } from './dto/receipt-event.dto';
import { AdjustmentEventDto } from './dto/adjustment-event.dto';
import { TollEventDto } from './dto/toll-event.dto';
import { RomaneioEventDto } from './dto/romaneio-event.dto';
import { GenericEventDto } from './dto/generic-event.dto';

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
  required: false,
})
@ApiHeader({
  name: 'idempotency-key',
  description: 'Chave de idempotência única para prevenir execuções duplicadas',
  required: false,
})
@UseGuards(ErpAuthGuard)
@Controller('api/v1/integrations/erp')
export class ErpIntegrationController {
  constructor(private readonly erpService: ErpIntegrationService) {}

  @Post('settlements')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe e sincroniza fechamentos financeiros / extratos emitidos pelo ERP',
    description: 'Atualiza valores de frete, pedágio, descontos, bônus e itens detalhados do motorista.',
  })
  @ApiResponse({ status: 200, description: 'Fechamento financeiro sincronizado com sucesso' })
  async receiveSettlement(
    @Body() dto: SettlementEventDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || dto.idempotencyKey;
    return this.erpService.processSettlement(dto, key);
  }

  @Post('payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe e registra confirmações de pagamentos e repasses efetuados pelo ERP',
    description: 'Registra comprovantes, transações PIX/TED e atualiza status do fechamento financeiro.',
  })
  @ApiResponse({ status: 200, description: 'Pagamento registrado com sucesso' })
  async receivePayment(
    @Body() dto: PaymentEventDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || dto.idempotencyKey;
    return this.erpService.processPayment(dto, key);
  }

  @Post('receipts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recebe e armazena comprovantes e documentos anexos validados pelo ERP',
  })
  @ApiResponse({ status: 200, description: 'Comprovante registrado com sucesso' })
  async receiveReceipt(
    @Body() dto: ReceiptEventDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || dto.idempotencyKey;
    return this.erpService.processReceipt(dto, key);
  }

  @Post('adjustments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registra ajustes financeiros (bônus, descontos, vales) diretamente em fechamentos',
  })
  @ApiResponse({ status: 200, description: 'Ajuste aplicado e saldo recalculado com sucesso' })
  async receiveAdjustment(
    @Body() dto: AdjustmentEventDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || dto.idempotencyKey;
    return this.erpService.processAdjustment(dto, key);
  }

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
    return this.erpService.processToll(dto, key);
  }

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
    return this.erpService.processRomaneio(dto, key);
  }

  @Post('events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Receptor central de Webhooks e eventos assíncronos do ecossistema ERP',
  })
  @ApiResponse({ status: 200, description: 'Evento aceito e processado com sucesso' })
  async receiveEvent(
    @Body() dto: GenericEventDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('x-idempotency-key') xIdempotencyHeader?: string,
  ) {
    const key = idempotencyHeader || xIdempotencyHeader || dto.idempotencyKey;
    return this.erpService.processEvent(dto, key);
  }
}
