import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUsersService } from './users/admin-users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin / Dashboard & Motoristas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('api/v1/admin')
export class AdminDashboardController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter indicadores do painel administrativo' })
  async getDashboardStats() {
    return this.adminUsersService.getDashboardStats();
  }

  @Get('drivers/unlinked')
  @ApiOperation({ summary: 'Listar motoristas ERP_ONLY sem login associado' })
  async getUnlinkedDrivers() {
    return this.adminUsersService.getUnlinkedDrivers();
  }

  @Get('drivers')
  @ApiOperation({ summary: 'Listar todos os motoristas com seus vínculos' })
  async getDriversList() {
    return this.adminUsersService.getDriversList();
  }
}
