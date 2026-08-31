import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
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

  @Get('build-info')
  @ApiOperation({ summary: 'Diagnóstico de build e versão do painel' })
  async getBuildInfo() {
    return {
      app: 'HK Connect',
      adminBuild: 'HK-ADMIN-ROUTE-WIZARD-02',
      buildTimestamp: new Date().toISOString(),
      railwayCommitSha: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || null,
      nodeEnv: process.env.NODE_ENV || 'development',
    };
  }

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

  @Post('trips')
  @ApiOperation({ summary: 'Criar nova viagem/rota operacional com paradas' })
  async createTrip(
    @Body() dto: any,
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.createAdminTrip(dto, actor);
  }

  @Patch('trips/:id')
  @ApiOperation({ summary: 'Editar rota operacional e suas paradas' })
  async updateTrip(
    @Param('id') id: string,
    @Body() dto: any,
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.updateAdminTrip(id, dto, actor);
  }

  @Post('trips/:id/assign')
  @ApiOperation({ summary: 'Atribuir/despachar rota para motorista e veículo' })
  async assignTrip(
    @Param('id') id: string,
    @Body() dto: { driverId: string; vehicleId?: string; notes?: string },
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.assignAdminTrip(id, dto, actor);
  }

  @Post('trips/:id/unassign')
  @ApiOperation({ summary: 'Retirar atribuição da rota antes do início' })
  async unassignTrip(
    @Param('id') id: string,
    @Body() dto: { reason: string },
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.unassignAdminTrip(id, dto, actor);
  }

  @Post('trips/:id/reassign')
  @ApiOperation({ summary: 'Trocar motorista da rota antes do início' })
  async reassignTrip(
    @Param('id') id: string,
    @Body() dto: { newDriverId: string; newVehicleId?: string; reason?: string },
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.reassignAdminTrip(id, dto, actor);
  }

  @Post('trips/:id/cancel')
  @ApiOperation({ summary: 'Cancelar rota com registro de motivo' })
  async cancelTrip(
    @Param('id') id: string,
    @Body() dto: { reason: string },
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.cancelAdminTrip(id, dto, actor);
  }

  @Delete('trips/:id')
  @ApiOperation({ summary: 'Excluir rascunho de rota' })
  async deleteTrip(
    @Param('id') id: string,
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.deleteAdminTrip(id, actor);
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
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminUsersService.listAdminRomaneios({ status, driverId, tripId, search, startDate, endDate });
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
  @ApiOperation({ summary: 'Listar e pesquisar Notas Fiscais eletrônicas com filtros operacionais' })
  async listInvoices(
    @Query('status') status?: InvoiceStatus,
    @Query('fiscalStatus') fiscalStatus?: string,
    @Query('routed') routed?: string,
    @Query('availableForRouting') availableForRouting?: string,
    @Query('city') city?: string,
    @Query('tripId') tripId?: string,
    @Query('driverId') driverId?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminUsersService.listAdminInvoices({
      status,
      fiscalStatus,
      routed,
      availableForRouting: availableForRouting === 'true' || availableForRouting === '1',
      city,
      tripId,
      driverId,
      search,
      startDate,
      endDate,
    });
  }

  @Get('invoices/available')
  @ApiOperation({ summary: 'Listar Notas Fiscais disponíveis para roteirização (sem viagem ativa)' })
  async getInvoicesAvailableForRouting(@Query('city') city?: string) {
    return this.adminUsersService.listAdminInvoices({
      availableForRouting: true,
      city,
    });
  }

  @Post('invoices/manual')
  @ApiOperation({ summary: 'Cadastrar Nota Fiscal manual (Contingência Operacional HK)' })
  async createManualInvoice(
    @Body() dto: {
      number: string;
      series?: string;
      accessKey?: string;
      recipient: string;
      recipientDocument?: string;
      address: string;
      numberAddress?: string;
      complement?: string;
      neighborhood?: string;
      city: string;
      state?: string;
      postalCode?: string;
      volumeCount?: number;
      weight?: number;
      value?: number;
      observations?: string;
      customerId?: string;
      customerName?: string;
    },
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.createManualInvoice(dto, actor);
  }

  @Post('invoices')
  @ApiOperation({ summary: 'Cadastrar Nota Fiscal (Alias)' })
  async createInvoiceAlias(
    @Body() dto: any,
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.createManualInvoice(dto, actor);
  }

  @Post('invoices/create-trip')
  @ApiOperation({ summary: 'Criar nova viagem/rota a partir de Notas Fiscais selecionadas no ERP/HK' })
  async createTripFromInvoices(
    @Body() dto: {
      invoiceIds: string[];
      driverId?: string;
      vehicleId?: string;
      origin?: string;
      tripCode?: string;
      startDate?: string;
      notes?: string;
      action?: 'DRAFT' | 'ASSIGN';
      stops?: any[];
    },
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.createTripFromInvoices(dto, actor);
  }

  @Post('trips/:id/invoices')
  @ApiOperation({ summary: 'Adicionar Notas Fiscais a uma rota/viagem existente' })
  async addInvoicesToExistingTrip(
    @Param('id') id: string,
    @Body() dto: { invoiceIds: string[] },
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.addInvoicesToTrip(id, dto.invoiceIds, actor);
  }

  @Post('invoices/add-to-trip')
  @ApiOperation({ summary: 'Adicionar Notas Fiscais a uma rota/viagem existente (Alias)' })
  async addInvoicesToTripAlias(
    @Body() dto: { tripId: string; invoiceIds: string[] },
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.addInvoicesToTrip(dto.tripId, dto.invoiceIds, actor);
  }

  @Post('invoices/sync-erp')
  @ApiOperation({ summary: 'Sincronizar/Reconciliar Notas Fiscais do ERP manualmente' })
  async syncErpInvoices(@GetUser() actor: { id: string }) {
    return this.adminUsersService.syncErpInvoices(actor);
  }

  @Post('invoices/:id/detach')
  @ApiOperation({ summary: 'Desvincular NF-e de rota antes do início' })
  async detachInvoiceFromTrip(
    @Param('id') id: string,
    @GetUser() actor: { id: string },
  ) {
    return this.adminUsersService.detachInvoiceFromTrip(id, actor);
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
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.adminUsersService.listAdminTolls({ status, driverId, tripId, startDate, endDate, search });
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
    @Body('notes') notes?: string,
    @GetUser() actor?: { id: string },
  ) {
    return this.adminUsersService.updateAdminTollStatus(id, status, notes, actor);
  }

  // --- FINANCEIRO ---
  @Get('settlements')
  @ApiOperation({ summary: 'Listar fechamentos financeiros' })
  async listSettlements(
    @Query('status') status?: string,
    @Query('driverId') driverId?: string,
    @Query('period') period?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminUsersService.listAdminSettlements({ status, driverId, period, search, startDate, endDate });
  }

  @Get('settlements/:id')
  @ApiOperation({ summary: 'Detalhes de um fechamento financeiro' })
  async getSettlementById(@Param('id') id: string) {
    return this.adminUsersService.getAdminSettlementById(id);
  }

  @Patch('settlements/:id/status')
  @ApiOperation({ summary: 'Atualizar status do fechamento financeiro (Ex: PAID, CANCELLED)' })
  async updateSettlementStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes?: string,
    @Body('paymentMethod') paymentMethod?: string,
    @Body('transactionId') transactionId?: string,
    @Body('receiptUrl') receiptUrl?: string,
    @GetUser() actor?: { id: string },
  ) {
    return this.adminUsersService.updateAdminSettlementStatus(
      id,
      { status, notes, paymentMethod, transactionId, receiptUrl },
      actor,
    );
  }

  // --- OCORRÊNCIAS ---
  @Get('occurrences')
  @ApiOperation({ summary: 'Listar todas as ocorrências operacionais' })
  async getOccurrences(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('driverId') driverId?: string,
    @Query('tripId') tripId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.adminUsersService.listAllOccurrences({ status, type, driverId, tripId, startDate, endDate, search });
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
    @Body('resolutionNotes') resolutionNotes?: string,
    @GetUser() actor?: { id: string },
  ) {
    return this.adminUsersService.updateOccurrenceStatus(id, status, resolutionNotes, actor);
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
  async getErpLogs(
    @Query('direction') direction?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    return this.adminUsersService.listErpLogs({
      direction,
      status,
      search,
      startDate,
      endDate,
      limit: limit ? Number(limit) : 50,
    });
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Trilha de auditoria e segurança' })
  async getAuditLogs(
    @Query('limit') limit?: number,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminUsersService.listAuditLogs(limit ? Number(limit) : 100, {
      userId,
      action,
      search,
      startDate,
      endDate,
    });
  }

  // --- CONFIGURAÇÕES & HEALTH ---
  @Get('config')
  @ApiOperation({ summary: 'Parâmetros reais e configurações do sistema HK Connect' })
  async getSystemConfig() {
    return this.adminUsersService.getSystemConfig();
  }
}

