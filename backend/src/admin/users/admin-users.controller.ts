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
import { UpdateStatusDto } from './dto/update-status.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin / Usuários')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
@Controller('api/v1/admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários do sistema',
    description:
      'Retorna a lista de usuários com motorista e veículo vinculado. Acesso restrito a ADMIN e MANAGER.',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Busca por nome, CPF ou telefone' })
  @ApiQuery({ name: 'role', enum: Role, required: false, description: 'Filtrar por perfil' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar por status (ACTIVE, INACTIVE, BLOCKED)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários recuperada com sucesso' })
  async listUsers(
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('status') status?: string,
  ) {
    return this.adminUsersService.listUsers({ search, role, status });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo usuário e perfil de motorista/veículo',
    description:
      'Cria um novo usuário no sistema. Se role for DRIVER, cria ou vincula o registro de motorista e veículo. Senhas são criptografadas com Argon2id.',
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'CPF já cadastrado' })
  @ApiResponse({ status: 403, description: 'Permissão insuficiente' })
  async createUser(
    @Body() dto: CreateUserDto,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminUsersService.createUser(dto, actor);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um usuário por ID' })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id') id: string) {
    return this.adminUsersService.getUserById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados cadastrais de um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminUsersService.updateUser(id, dto, actor);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Alterar status do usuário (ACTIVE, INACTIVE, BLOCKED)',
    description:
      'Altera o status. Se for diferente de ACTIVE, todas as sessões e tokens ativos são revogados imediatamente.',
  })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminUsersService.updateStatus(id, dto, actor);
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Redefinir senha de um usuário',
    description:
      'Redefine a senha com Argon2id e revoga imediatamente todos os refresh tokens ativos para forçar novo login.',
  })
  @ApiResponse({ status: 200, description: 'Senha redefinida com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminUsersService.resetPassword(id, dto, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Excluir ou desativar usuário com segurança',
    description:
      'Se o usuário possuir histórico de viagens ou fechamentos contábeis, é desativado de forma segura (soft-deactivation) para preservar a integridade fiscal.',
  })
  @ApiResponse({ status: 200, description: 'Usuário excluído ou desativado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async deleteUser(
    @Param('id') id: string,
    @GetUser() actor: { id: string; role: Role },
  ) {
    return this.adminUsersService.deleteUser(id, actor);
  }
}
