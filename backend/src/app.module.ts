import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DriversModule } from './drivers/drivers.module';
import { TripsModule } from './trips/trips.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { InvoicesModule } from './invoices/invoices.module';
import { RoutingModule } from './routing/routing.module';
import { OccurrencesModule } from './occurrences/occurrences.module';
import { RomaneiosModule } from './romaneios/romaneios.module';
import { TollsModule } from './tolls/tolls.module';
import { FinanceModule } from './finance/finance.module';
import { HealthModule } from './health/health.module';
import { ErpIntegrationModule } from './integrations/erp/erp-integration.module';
import { AdminModule } from './admin/admin.module';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DriversModule,
    TripsModule,
    DeliveriesModule,
    InvoicesModule,
    RoutingModule,
    OccurrencesModule,
    RomaneiosModule,
    TollsModule,
    FinanceModule,
    HealthModule,
    ErpIntegrationModule,
    AdminModule,
    TrackingModule,
  ],
})
export class AppModule {}
