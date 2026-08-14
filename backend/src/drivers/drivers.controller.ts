import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Drivers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna os dados cadastrais do motorista autenticado' })
  async getMyDriverProfile(@GetUser('id') userId: string) {
    return this.driversService.getMyDriverProfile(userId);
  }

  @Get('me/vehicle')
  @ApiOperation({ summary: 'Retorna o veículo atualmente vinculado ao motorista' })
  async getMyCurrentVehicle(@GetUser('driverId') driverId: string) {
    return this.driversService.getMyCurrentVehicle(driverId);
  }
}
