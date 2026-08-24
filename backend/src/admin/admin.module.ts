import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';
import { AdminTrackingController } from './tracking/admin-tracking.controller';
import { AdminTrackingService } from './tracking/admin-tracking.service';
import { AdminWebController } from './web/admin-web.controller';
import { AuditService } from '../common/services/audit.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminUsersController,
    AdminTrackingController,
    AdminWebController,
  ],
  providers: [
    AdminUsersService,
    AdminTrackingService,
    AuditService,
  ],
  exports: [AdminUsersService, AdminTrackingService, AuditService],
})
export class AdminModule {}
