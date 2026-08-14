import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw UnauthorizedException for non-existing user on login', async () => {
    mockPrismaService.user.findFirst.mockResolvedValue(null);

    await expect(
      service.login({ phone_or_cpf: '00000000000', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if user is blocked', async () => {
    mockPrismaService.user.findFirst.mockResolvedValue({
      id: 'usr-1',
      status: 'BLOCKED',
    });

    await expect(
      service.login({ phone_or_cpf: '38920184910', password: 'senha123' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should return tokens on valid credentials', async () => {
    const passwordHash = await argon2.hash('senha123');
    mockPrismaService.user.findFirst.mockResolvedValue({
      id: 'usr-1',
      name: 'João da Silva',
      cpf: '38920184910',
      phone: '(11) 98765-4321',
      passwordHash,
      role: 'DRIVER',
      status: 'ACTIVE',
      driver: {
        id: 'drv-1',
        cnh: '04829103920',
        cnhCategory: 'AE',
        rntrc: '8493021',
        status: 'ATIVO',
        assignments: [
          {
            vehicle: {
              id: 'vhc-1',
              plate: 'ABC-1234',
              model: 'FH 540',
              brand: 'Volvo',
            },
          },
        ],
      },
    });

    mockPrismaService.refreshToken.create.mockResolvedValue({});

    const result = await service.login({
      phone_or_cpf: '38920184910',
      password: 'senha123',
    });

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('refresh_token');
    expect(result.user.cpf).toBe('38920184910');
  });

  it('should revoke all tokens on refresh token reuse detection', async () => {
    mockJwtService.verify.mockReturnValue({ sub: 'usr-1' });
    mockPrismaService.refreshToken.findUnique.mockResolvedValue({
      id: 'ref-1',
      userId: 'usr-1',
      isRevoked: true, // Already revoked token!
    });

    await expect(
      service.refreshToken({ refresh_token: 'revoked_token' }),
    ).rejects.toThrow(ForbiddenException);

    expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'usr-1' },
      data: { isRevoked: true },
    });
  });
});
