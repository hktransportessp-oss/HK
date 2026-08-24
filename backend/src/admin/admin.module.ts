import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditService } from '../common/services/audit.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminVehiclesController } from './vehicles/admin-vehicles.controller';
import { AdminVehiclesService } from './vehicles/admin-vehicles.service';
import { AdminWebController } from './admin-web.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminWebController,
    AdminDashboardController,
    AdminUsersController,
    AdminVehiclesController,
  ],
  providers: [AdminUsersService, AdminVehiclesService, AuditService],
  exports: [AdminUsersService, AdminVehiclesService],
})
export class AdminModule {}

