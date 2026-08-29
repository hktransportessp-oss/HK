import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RomaneiosService } from './romaneios.service';
import { CreateRomaneioDto } from './dto/create-romaneio.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { RomaneioStatus, Role } from '@prisma/client';

@ApiTags('Romaneios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/romaneios')
export class RomaneiosController {
  constructor(private readonly romaneiosService: RomaneiosService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo romaneio de carga' })
  async create(
    @Body() dto: CreateRomaneioDto,
    @GetUser('driverId') driverId: string,
  ) {
    return this.romaneiosService.create(dto, driverId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os romaneios enviados pelo motorista' })
  async findAll(@GetUser('driverId') driverId: string) {
    return this.romaneiosService.findAllForDriver(driverId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém detalhes de um romaneio específico' })
  async findOne(
    @Param('id') id: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.romaneiosService.findOne(id, driverId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Atualiza o status de conferência do romaneio (Restrito Admin/Manager)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: RomaneioStatus,
    @GetUser('driverId') driverId: string,
  ) {
    return this.romaneiosService.updateStatus(id, status, driverId);
  }
}
