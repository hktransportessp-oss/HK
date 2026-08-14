import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as viagens associadas ao motorista' })
  async findAll(@GetUser('driverId') driverId: string) {
    return this.tripsService.findAllForDriver(driverId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém detalhes completos de uma viagem por UUID' })
  async findOne(
    @Param('id') id: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.tripsService.findOne(id, driverId);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Aceita uma viagem atribuída' })
  async acceptTrip(
    @Param('id') id: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.tripsService.acceptTrip(id, driverId);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Inicia uma viagem aceita' })
  async startTrip(
    @Param('id') id: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.tripsService.startTrip(id, driverId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Finaliza a viagem após conclusão das entregas' })
  async completeTrip(
    @Param('id') id: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.tripsService.completeTrip(id, driverId);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova viagem (suporta idempotência)' })
  async create(
    @Body() dto: CreateTripDto,
    @GetUser('driverId') driverId: string,
  ) {
    return this.tripsService.create(dto, driverId);
  }
}
