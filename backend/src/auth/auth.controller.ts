import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Auth')
@Controller('api/v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticação do usuário e emissão de JWT' })
  @ApiResponse({ status: 200, description: 'Login efetuado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovação de Access Token via Refresh Token com Rotação' })
  @ApiResponse({ status: 200, description: 'Token renovado' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado' })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshToken(dto);
  }

  @Post('auth/logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encerramento de sessão e revogação do Refresh Token' })
  async logout(@GetUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get(['me', 'users/me'])
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado na sessão' })
  async getMe(@GetUser() user: any) {
    return {
      user: {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        phone: user.phone,
        role: user.role,
      },
      driver: user.driver
        ? {
            id: user.driver.id,
            user_id: user.id,
            cnh: user.driver.cnh,
            cnh_category: user.driver.cnhCategory,
            rntrc: user.driver.rntrc,
            status: user.driver.status,
          }
        : null,
      vehicle: user.vehicle
        ? {
            id: user.vehicle.id,
            plate: user.vehicle.plate,
            model: user.vehicle.model,
            brand: user.vehicle.brand,
          }
        : null,
    };
  }
}
