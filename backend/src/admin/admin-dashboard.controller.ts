import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUsersService } from './users/admin-users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin / Dashboard & Operações')
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

  @Get('occurrences')
  @ApiOperation({ summary: 'Listar todas as ocorrências operacionais' })
  async getOccurrences(
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.adminUsersService.listAllOccurrences({ status, type });
  }

  @Patch('occurrences/:id/status')
  @ApiOperation({ summary: 'Atualizar status de uma ocorrência' })
  async updateOccurrenceStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.updateOccurrenceStatus(id, status, actor);
  }

  @Get('tracking')
  @ApiOperation({ summary: 'Obter última localização dos motoristas em trânsito' })
  async getTracking() {
    return this.adminUsersService.listTrackingLocations();
  }

  @Get('erp-logs')
  @ApiOperation({ summary: 'Histórico de eventos de integração ERP' })
  async getErpLogs(@Query('limit') limit?: number) {
    return this.adminUsersService.listErpLogs(limit ? Number(limit) : 50);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Trilha de auditoria e segurança' })
  async getAuditLogs(@Query('limit') limit?: number) {
    return this.adminUsersService.listAuditLogs(limit ? Number(limit) : 100);
  }
}
