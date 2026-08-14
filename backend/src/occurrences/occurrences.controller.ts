import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OccurrencesService } from './occurrences.service';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Occurrences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/occurrences')
export class OccurrencesController {
  constructor(private readonly occurrencesService: OccurrencesService) {}

  @Post()
  @ApiOperation({ summary: 'Registra uma nova ocorrência na viagem/entrega' })
  async create(
    @Body() dto: CreateOccurrenceDto,
    @GetUser('driverId') driverId: string,
  ) {
    return this.occurrencesService.create(dto, driverId);
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Lista ocorrências de uma viagem' })
  async findAllForTrip(
    @Param('tripId') tripId: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.occurrencesService.findAllForTrip(tripId, driverId);
  }
}
