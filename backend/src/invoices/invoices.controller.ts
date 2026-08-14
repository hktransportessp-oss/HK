import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { ScanInvoiceDto } from './dto/scan-invoice.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('scan')
  @ApiOperation({
    summary: 'Processa bipagem de NF-e e vincula à viagem/carga',
  })
  async scanInvoice(
    @Body() dto: ScanInvoiceDto,
    @GetUser('driverId') driverId: string,
  ) {
    return this.invoicesService.scanAndAttach(dto, driverId);
  }

  @Get('key/:accessKey')
  @ApiOperation({ summary: 'Obtém detalhes de uma NF-e por chave de acesso' })
  async getByAccessKey(
    @Param('accessKey') accessKey: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.invoicesService.getByAccessKey(accessKey, driverId);
  }
}
