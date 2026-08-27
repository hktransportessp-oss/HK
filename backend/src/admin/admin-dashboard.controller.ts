import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminUsersService } from './users/admin-users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Role, TripStatus, RomaneioStatus, TollStatus, InvoiceStatus } from '@prisma/client';

@ApiTags('Admin / Dashboard & Operações')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('api/v1/admin')
export class AdminDashboardController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter indicadores e listas rápidas do painel operacional' })
  async getDashboardStats() {
    return this.adminUsersService.getDashboardStats();
  }

  // --- MOTORISTAS ---
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

  @Get('drivers/:id')
  @ApiOperation({ summary: 'Detalhes operacionais completos de um motorista' })
  async getDriverDetails(@Param('id') id: string) {
    return this.adminUsersService.getDriverDetails(id);
  }

  @Post('drivers/:id/assign-vehicle')
  @ApiOperation({ summary: 'Vincular veículo a um motorista' })
  async assignDriverVehicle(
    @Param('id') id: string,
    @Body('vehicleId') vehicleId: string,
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.assignDriverVehicle(id, vehicleId, actor);
  }

  @Post('drivers/:id/unassign-vehicle')
  @ApiOperation({ summary: 'Desvincular veículo de um motorista' })
  async unassignDriverVehicle(
    @Param('id') id: string,
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.unassignDriverVehicle(id, actor);
  }

  @Patch('drivers/:id/status')
  @ApiOperation({ summary: 'Alterar status operacional do motorista' })
  async updateDriverStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.updateDriverStatus(id, status, actor);
  }

  // --- VIAGENS ---
  @Get('trips')
  @ApiOperation({ summary: 'Listar viagens operacionais com filtros' })
  async listTrips(
    @Query('status') status?: string,
    @Query('driverId') driverId?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminUsersService.listAdminTrips({
      status,
      driverId,
      vehicleId,
      search,
      startDate,
      endDate,
    });
  }

  @Get('trips/:id')
  @ApiOperation({ summary: 'Detalhes completos de uma viagem' })
  async getTripById(@Param('id') id: string) {
    return this.adminUsersService.getAdminTripById(id);
  }

  @Patch('trips/:id/status')
  @ApiOperation({ summary: 'Atualizar status de uma viagem' })
  async updateTripStatus(
    @Param('id') id: string,
    @Body('status') status: TripStatus,
    @Body('notes') notes?: string,
    @GetUser() actor?: { id: string },
  ) {
    return this.adminUsersService.updateAdminTripStatus(id, status, notes, actor);
  }

  // --- ROMANEIOS ---
  @Get('romaneios')
  @ApiOperation({ summary: 'Listar romaneios com filtros' })
  async listRomaneios(
    @Query('status') status?: RomaneioStatus,
    @Query('driverId') driverId?: string,
    @Query('tripId') tripId?: string,
    @Query('search') search?: string,
  ) {
    return this.adminUsersService.listAdminRomaneios({ status, driverId, tripId, search });
  }

  @Get('romaneios/:id')
  @ApiOperation({ summary: 'Detalhes de um romaneio e documentos' })
  async getRomaneioById(@Param('id') id: string) {
    return this.adminUsersService.getAdminRomaneioById(id);
  }

  @Patch('romaneios/:id/status')
  @ApiOperation({ summary: 'Aprovar ou rejeitar status de um romaneio' })
  async updateRomaneioStatus(
    @Param('id') id: string,
    @Body('status') status: RomaneioStatus,
    @Body('notes') notes?: string,
    @GetUser() actor?: { id: string },
  ) {
    return this.adminUsersService.updateAdminRomaneioStatus(id, status, notes, actor);
  }

  // --- NOTAS FISCAIS ---
  @Get('invoices')
  @ApiOperation({ summary: 'Listar e pesquisar Notas Fiscais eletrônicas' })
  async listInvoices(
    @Query('status') status?: InvoiceStatus,
    @Query('tripId') tripId?: string,
    @Query('search') search?: string,
  ) {
    return this.adminUsersService.listAdminInvoices({ status, tripId, search });
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Detalhes de uma Nota Fiscal' })
  async getInvoiceById(@Param('id') id: string) {
    return this.adminUsersService.getAdminInvoiceById(id);
  }

  // --- PEDÁGIOS ---
  @Get('tolls')
  @ApiOperation({ summary: 'Listar lançamentos de pedágio' })
  async listTolls(
    @Query('status') status?: TollStatus,
    @Query('driverId') driverId?: string,
    @Query('tripId') tripId?: string,
  ) {
    return this.adminUsersService.listAdminTolls({ status, driverId, tripId });
  }

  @Get('tolls/:id')
  @ApiOperation({ summary: 'Detalhes e comprovante de um pedágio' })
  async getTollById(@Param('id') id: string) {
    return this.adminUsersService.getAdminTollById(id);
  }

  @Patch('tolls/:id/status')
  @ApiOperation({ summary: 'Aprovar ou rejeitar reembolso de pedágio' })
  async updateTollStatus(
    @Param('id') id: string,
    @Body('status') status: TollStatus,
    @GetUser() actor?: { id: string },
  ) {
    return this.adminUsersService.updateAdminTollStatus(id, status, actor);
  }

  // --- FINANCEIRO ---
  @Get('settlements')
  @ApiOperation({ summary: 'Listar fechamentos financeiros' })
  async listSettlements(
    @Query('status') status?: string,
    @Query('driverId') driverId?: string,
    @Query('period') period?: string,
  ) {
    return this.adminUsersService.listAdminSettlements({ status, driverId, period });
  }

  @Get('settlements/:id')
  @ApiOperation({ summary: 'Detalhes de um fechamento financeiro' })
  async getSettlementById(@Param('id') id: string) {
    return this.adminUsersService.getAdminSettlementById(id);
  }

  // --- OCORRÊNCIAS ---
  @Get('occurrences')
  @ApiOperation({ summary: 'Listar todas as ocorrências operacionais' })
  async getOccurrences(
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    return this.adminUsersService.listAllOccurrences({ status, type });
  }

  @Get('occurrences/:id')
  @ApiOperation({ summary: 'Detalhes de uma ocorrência operacional' })
  async getOccurrenceById(@Param('id') id: string) {
    return this.adminUsersService.getOccurrenceById(id);
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

  // --- RASTREAMENTO & TELEMETRIA ---
  @Get('tracking')
  @ApiOperation({ summary: 'Obter última localização dos motoristas em trânsito' })
  async getTracking() {
    return this.adminUsersService.listTrackingLocations();
  }

  // --- LOGS & AUDITORIA ---
  @Get('erp-logs')
  @ApiOperation({ summary: 'Histórico de eventos de integração ERP' })
  async getErpLogs(@Query('limit') limit?: number) {
    return this.adminUsersService.listErpLogs(limit ? Number(limit) : 50);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Trilha de auditoria e segurança' })
  async getAuditLogs(
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
  ) {
    return this.adminUsersService.listAuditLogs(limit ? Number(limit) : 100, { userId, action });
  }
}

