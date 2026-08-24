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
import { TollEventDto } from './dto/toll-event.dto';
import { RomaneioEventDto } from './dto/romaneio-event.dto';

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
