import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async login(dto: LoginDto) {
    const cleanInput = dto.phone_or_cpf.replace(/\D/g, '');

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { cpf: cleanInput },
          { cpf: dto.phone_or_cpf },
          { phone: dto.phone_or_cpf },
        ],
      },
      include: {
        driver: {
          include: {
            assignments: {
              where: { isCurrent: true },
              include: { vehicle: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status === 'BLOCKED') {
      throw new ForbiddenException('Usuário bloqueado pelo sistema');
    }

    if (user.status === 'INACTIVE') {
      throw new ForbiddenException('Usuário inativo');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateAuthTokens(user);
  }

  async refreshToken(dto: RefreshDto) {
    const { refresh_token } = dto;
    let payload: any;

    try {
      payload = this.jwtService.verify(refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET || 'hk_jwt_refresh_secret_super_key_2026_prod',
      });
    } catch {
      throw new UnauthorizedException('Refresh token expirado ou inválido');
    }

    const tokenHash = this.hashToken(refresh_token);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    if (storedToken.isRevoked) {
      // Reuse detection: revoke all tokens for this user
      await this.prisma.refreshToken.updateMany({
        where: { userId: payload.sub },
        data: { isRevoked: true },
      });
      throw new ForbiddenException('Reutilização de token revogado detectada. Sessão encerrada.');
    }

    // Revoke current token (Rotation)
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        driver: {
          include: {
            assignments: {
              where: { isCurrent: true },
              include: { vehicle: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Usuário inativo ou inexistente');
    }

    return this.generateAuthTokens(user);
  }

  async logout(userId: string) {
    if (userId) {
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    }
    return { message: 'Logout realizado com sucesso' };
  }

  private async generateAuthTokens(user: any) {
    const jti = uuidv4();
    const driverId = user.driver?.id || null;
    const currentVehicle = user.driver?.assignments[0]?.vehicle || null;

    const accessPayload = {
      sub: user.id,
      role: user.role,
      driverId: driverId,
      jti: jti,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: process.env.JWT_ACCESS_SECRET || 'hk_jwt_access_secret_super_key_2026_prod',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshPayload = {
      sub: user.id,
      jti: uuidv4(),
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET || 'hk_jwt_refresh_secret_super_key_2026_prod',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });

    const refreshHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHash,
        expiresAt: expiresAt,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutos em segundos
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
      vehicle: currentVehicle
        ? {
            id: currentVehicle.id,
            driver_id: user.driver?.id || '',
            plate: currentVehicle.plate,
            model: currentVehicle.model,
            brand: currentVehicle.brand,
          }
        : null,
    };
  }
}
