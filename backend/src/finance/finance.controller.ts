import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('settlements')
  @ApiOperation({ summary: 'Consulta fechamentos/extratos financeiros do motorista' })
  async findSettlements(@GetUser('driverId') driverId: string) {
    return this.financeService.findSettlementsForDriver(driverId);
  }

  @Get('settlements/:id')
  @ApiOperation({ summary: 'Obtém detalhes do fechamento com itens e pagamentos' })
  async findSettlementById(
    @Param('id') id: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.financeService.findSettlementById(id, driverId);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Histórico de pagamentos efetuados ao motorista' })
  async findPayments(@GetUser('driverId') driverId: string) {
    return this.financeService.findPaymentsForDriver(driverId);
  }
}
