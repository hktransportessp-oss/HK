import { Module } from '@nestjs/common';
import { RoutingController } from './routing.controller';
import { RouteOptimizationService } from './route-optimization.service';
import { GeocodingService } from './geocoding.service';

@Module({
  controllers: [RoutingController],
  providers: [RouteOptimizationService, GeocodingService],
  exports: [RouteOptimizationService, GeocodingService],
})
export class RoutingModule {}
