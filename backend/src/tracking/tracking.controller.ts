import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { DriverLocationDto } from './dto/driver-location.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Tracking - Rastreamento Operacional')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('location')
  @Roles(Role.DRIVER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar coordenada GPS enviada pelo app do motorista',
    description: 'Identifica o motorista estritamente a partir do JWT autenticado e atualiza o histórico e a última posição.',
  })
  @ApiResponse({ status: 200, description: 'Coordenada registrada e validada com sucesso' })
  @ApiResponse({ status: 400, description: 'Payload ou timestamp inválido' })
  @ApiResponse({ status: 403, description: 'Usuário sem permissão ou viagem não pertencente ao motorista' })
  async recordLocation(
    @Body() dto: DriverLocationDto,
    @GetUser('driverId') driverId: string | null,
    @GetUser() user: any,
  ) {
    const effectiveDriverId = driverId || user?.driver?.id;
    if (!effectiveDriverId) {
      throw new BadRequestException('Usuário autenticado não possui perfil de motorista vinculado');
    }

    return this.trackingService.recordLocation(effectiveDriverId, dto);
  }
}
