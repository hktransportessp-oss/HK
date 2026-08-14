import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveriesService } from './deliveries.service';
import { CompleteDeliveryDto } from './dto/complete-delivery.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Deliveries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtém detalhes de uma entrega' })
  async findOne(
    @Param('id') id: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.deliveriesService.findOne(id, driverId);
  }

  @Post(':id/arrive')
  @ApiOperation({ summary: 'Registra chegada ao destino da entrega' })
  async arrive(
    @Param('id') id: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.deliveriesService.arrive(id, driverId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Confirma a entrega (Total, Parcial ou Recusa)' })
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteDeliveryDto,
    @GetUser('driverId') driverId: string,
  ) {
    return this.deliveriesService.complete(id, dto, driverId);
  }

  @Post(':id/pod')
  @ApiOperation({ summary: 'Registra upload do canhoto digital da entrega' })
  async uploadPod(
    @Param('id') id: string,
    @Body() body: { podUrl: string; podFileHash?: string },
    @GetUser('driverId') driverId: string,
  ) {
    return this.deliveriesService.uploadPod(
      id,
      body.podUrl,
      body.podFileHash,
      driverId,
    );
  }
}
