import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
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

  @Post('location')
  @ApiOperation({ summary: 'Envia atualização de telemetria e coordenadas GPS do motorista' })
  async updateLocation(
    @GetUser('driverId') driverId: string,
    @Body() body: {
      latitude: number;
      longitude: number;
      speed?: number;
      accuracy?: number;
      heading?: number;
      tripId?: string;
      capturedAt?: string;
    },
  ) {
    return this.driversService.updateLocation(driverId, body);
  }
}
