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
import { TollsService } from './tolls.service';
import { CreateTollDto } from './dto/create-toll.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { TollStatus, Role } from '@prisma/client';

@ApiTags('Tolls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/tolls')
export class TollsController {
  constructor(private readonly tollsService: TollsService) {}

  @Post()
  @ApiOperation({ summary: 'Envia um novo comprovante de pedágio para reembolso' })
  async create(
    @Body() dto: CreateTollDto,
    @GetUser('driverId') driverId: string,
  ) {
    return this.tollsService.create(dto, driverId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os comprovantes de pedágio do motorista' })
  async findAll(@GetUser('driverId') driverId: string) {
    return this.tollsService.findAllForDriver(driverId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém detalhes de um comprovante de pedágio' })
  async findOne(
    @Param('id') id: string,
    @GetUser('driverId') driverId: string,
  ) {
    return this.tollsService.findOne(id, driverId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Atualiza o status de aprovação/reembolso do pedágio (Restrito Admin/Manager)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TollStatus,
    @GetUser('driverId') driverId: string,
  ) {
    return this.tollsService.updateStatus(id, status, driverId);
  }
}
