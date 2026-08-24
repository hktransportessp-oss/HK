import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { AdminUsersService } from './admin-users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { LinkDriverDto } from './dto/link-driver.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin - Gestão de Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('api/v1/admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuários do app com dados agregados de motorista e veículo',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Busca por nome, telefone ou CPF' })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'status', required: false, example: 'ACTIVE' })
  @ApiQuery({ name: 'hasDriver', required: false, example: 'true' })
  @ApiResponse({ status: 200, description: 'Lista de usuários recuperada com sucesso' })
  async listUsers(
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('status') status?: string,
    @Query('hasDriver') hasDriver?: string,
  ) {
    return this.adminUsersService.listUsers({ search, role, status, hasDriver });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes completos de um usuário específico' })
  @ApiResponse({ status: 200, description: 'Detalhes do usuário recuperados com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id') id: string) {
    return this.adminUsersService.getUserById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar novo usuário com senha criptografada via Argon2id' })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso' })
  @ApiResponse({ status: 409, description: 'CPF já cadastrado ou conflito de motorista' })
  async createUser(
    @Body() dto: CreateUserDto,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminUsersService.createUser(dto, actor);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados cadastrais do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminUsersService.updateUser(id, dto, actor);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Redefinir senha do usuário e revogar sessões ativas' })
  @ApiResponse({ status: 200, description: 'Senha alterada e sessões revogadas com sucesso' })
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminUsersService.resetPassword(id, dto, actor);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alterar status operacional do usuário (ACTIVE, INACTIVE, BLOCKED)' })
  @ApiResponse({ status: 200, description: 'Status alterado com sucesso' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminUsersService.updateStatus(id, dto, actor);
  }

  @Patch(':id/driver')
  @ApiOperation({ summary: 'Vincular ou desvincular motorista (inclusive status ERP_ONLY)' })
  @ApiResponse({ status: 200, description: 'Vínculo do motorista atualizado com sucesso' })
  async linkDriver(
    @Param('id') id: string,
    @Body() dto: LinkDriverDto,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminUsersService.linkDriver(id, dto, actor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Exclusão segura (soft-deactivation se houver histórico)' })
  @ApiResponse({ status: 200, description: 'Usuário excluído ou inativado com segurança' })
  async deleteUser(
    @Param('id') id: string,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminUsersService.deleteUser(id, actor);
  }
}
