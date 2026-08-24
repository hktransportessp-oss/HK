import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminVehiclesService } from './admin-vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin / Veículos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('api/v1/admin/vehicles')
export class AdminVehiclesController {
  constructor(private readonly adminVehiclesService: AdminVehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os veículos cadastrados na frota' })
  @ApiQuery({ name: 'search', required: false, description: 'Busca por placa, modelo ou marca' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por status' })
  async listVehicles(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.adminVehiclesService.listVehicles({ search, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um veículo' })
  async getVehicleById(@Param('id') id: string) {
    return this.adminVehiclesService.getVehicleById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar novo veículo na frota' })
  async createVehicle(
    @Body() dto: CreateVehicleDto,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminVehiclesService.createVehicle(dto, actor);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de um veículo' })
  async updateVehicle(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminVehiclesService.updateVehicle(id, dto, actor);
  }
}
