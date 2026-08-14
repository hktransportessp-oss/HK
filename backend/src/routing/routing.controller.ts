import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RouteOptimizationService } from './route-optimization.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Routing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/trips')
export class RoutingController {
  constructor(
    private readonly routeOptimizationService: RouteOptimizationService,
  ) {}

  @Post(':id/optimize-route')
  @ApiOperation({
    summary:
      'Gera rota otimizada e sequência de entregas priorizando janelas de atendimento',
  })
  async optimizeRoute(
    @Param('id') tripId: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.routeOptimizationService.optimizeTripRoute(tripId, driverId);
  }
}
