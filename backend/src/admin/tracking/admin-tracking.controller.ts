import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminTrackingService } from './admin-tracking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin - Rastreamento Telemetria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('api/v1/admin/tracking')
export class AdminTrackingController {
  constructor(private readonly adminTrackingService: AdminTrackingService) {}

  @Get('drivers')
  @ApiOperation({ summary: 'Obter última posição e status de todos os motoristas' })
  @ApiQuery({ name: 'status', required: false, description: 'EM_MOVIMENTO | PARADO | SEM_ATUALIZACAO | OFFLINE' })
  @ApiQuery({ name: 'inTrip', required: false, description: 'true | false' })
  @ApiQuery({ name: 'search', required: false, description: 'Nome, placa ou código de viagem' })
  @ApiResponse({ status: 200, description: 'Lista de posições recentes' })
  async getDriversLocations(
    @Query('status') status?: string,
    @Query('inTrip') inTrip?: string,
    @Query('search') search?: string,
  ) {
    return this.adminTrackingService.getAllDriversLastLocations({ status, inTrip, search });
  }

  @Get('active')
  @ApiOperation({ summary: 'Obter apenas motoristas com viagens ativas ou posições recentes (< 30 min)' })
  @ApiResponse({ status: 200, description: 'Motoristas ativos' })
  async getActiveDrivers() {
    return this.adminTrackingService.getActiveDrivers();
  }

  @Get('drivers/:driverId')
  @ApiOperation({ summary: 'Obter detalhes e última localização de um motorista específico' })
  @ApiResponse({ status: 200, description: 'Detalhes operacionais do motorista' })
  async getDriverDetails(@Param('driverId') driverId: string) {
    return this.adminTrackingService.getDriverDetails(driverId);
  }

  @Get('drivers/:driverId/history')
  @ApiOperation({ summary: 'Obter trilha histórica de posições de um motorista' })
  @ApiQuery({ name: 'period', required: false, enum: ['2h', '6h', '12h', '24h'] })
  @ApiQuery({ name: 'from', required: false, description: 'Data/hora ISO inicial' })
  @ApiQuery({ name: 'to', required: false, description: 'Data/hora ISO final' })
  @ApiQuery({ name: 'limit', required: false, description: 'Máximo de pontos (padrão 1000, máx 2000)' })
  @ApiResponse({ status: 200, description: 'Trilha histórica recuperada' })
  async getDriverHistory(
    @Param('driverId') driverId: string,
    @Query('period') period?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: number,
  ) {
    return this.adminTrackingService.getDriverHistory(driverId, { period, from, to, limit });
  }
}
