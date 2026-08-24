import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersService } from './admin-users.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../../common/services/audit.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as argon2 from 'argon2';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      driver: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      refreshToken: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (cb) => {
        if (Array.isArray(cb)) {
          return Promise.all(cb);
        }
        return cb(mockPrisma);
      }),
    };

    mockAudit = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
  });

  it('ADMIN deve conseguir criar usuário com perfil DRIVER', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-1',
      name: 'João Silva',
      cpf: '12345678900',
      role: Role.DRIVER,
      status: 'ACTIVE',
    });
    mockPrisma.driver.create.mockResolvedValue({ id: 'driver-1', userId: 'user-1' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'João Silva',
      cpf: '12345678900',
      role: Role.DRIVER,
      status: 'ACTIVE',
      refreshTokens: [],
      driver: { id: 'driver-1', assignments: [], trips: [] },
    });

    const res = await service.createUser(
      {
        name: 'João Silva',
        cpf: '123.456.789-00',
        password: 'Password#123',
        role: Role.DRIVER,
      },
      { id: 'admin-id', role: Role.ADMIN },
    );

    expect(res.id).toBe('user-1');
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_CREATED' }),
    );
  });

  it('MANAGER deve conseguir criar usuário com perfil DRIVER', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-2',
      name: 'Maria Motorista',
      cpf: '98765432100',
      role: Role.DRIVER,
      status: 'ACTIVE',
    });
    mockPrisma.driver.create.mockResolvedValue({ id: 'driver-2', userId: 'user-2' });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      name: 'Maria Motorista',
      cpf: '98765432100',
      role: Role.DRIVER,
      status: 'ACTIVE',
      refreshTokens: [],
      driver: { id: 'driver-2', assignments: [], trips: [] },
    });

    const res = await service.createUser(
      {
        name: 'Maria Motorista',
        cpf: '987.654.321-00',
        password: 'Password#123',
        role: Role.DRIVER,
      },
      { id: 'manager-id', role: Role.MANAGER },
    );

    expect(res.id).toBe('user-2');
  });

  it('MANAGER NÃO pode criar usuário com perfil ADMIN', async () => {
    await expect(
      service.createUser(
        {
          name: 'Tentativa Admin',
          cpf: '111.222.333-44',
          password: 'Password#123',
          role: Role.ADMIN,
        },
        { id: 'manager-id', role: Role.MANAGER },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve retornar conflito (409) se CPF já estiver cadastrado', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-id', cpf: '12345678900' });

    await expect(
      service.createUser(
        {
          name: 'Outro Usuário',
          cpf: '123.456.789-00',
          password: 'Password#123',
          role: Role.DRIVER,
        },
        { id: 'admin-id', role: Role.ADMIN },
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('deve vincular Driver existente (ERP_ONLY) sem duplicar registro', async () => {
    const erpDriverId = 'erp-driver-uuid';
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.driver.findUnique.mockResolvedValue({
      id: erpDriverId,
      userId: null,
      status: 'ERP_ONLY',
    });
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-3',
      name: 'Motorista ERP',
      cpf: '55544433322',
      role: Role.DRIVER,
      status: 'ACTIVE',
    });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-3',
      name: 'Motorista ERP',
      cpf: '55544433322',
      role: Role.DRIVER,
      status: 'ACTIVE',
      refreshTokens: [],
      driver: { id: erpDriverId, assignments: [], trips: [] },
    });

    const res = await service.createUser(
      {
        name: 'Motorista ERP',
        cpf: '555.444.333-22',
        password: 'Password#123',
        role: Role.DRIVER,
        driverId: erpDriverId,
      },
      { id: 'admin-id', role: Role.ADMIN },
    );

    expect(res.id).toBe('user-3');
    expect(mockPrisma.driver.update).toHaveBeenCalledWith({
      where: { id: erpDriverId },
      data: { userId: 'user-3', status: 'ATIVO' },
    });
    expect(mockPrisma.driver.create).not.toHaveBeenCalled();
  });

  it('reset de senha deve aplicar Argon2id e revogar todos os refresh tokens', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', role: Role.DRIVER });

    const res = await service.resetPassword(
      'user-1',
      { password: 'NewSecurePassword#2026' },
      { id: 'admin-id', role: Role.ADMIN },
    );

    expect(res.success).toBe(true);
    expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', isRevoked: false },
      data: { isRevoked: true },
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
      }),
    );
  });

  it('exclusão de usuário com histórico operacional deve inativar (soft-deactivation)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-with-trips',
      role: Role.DRIVER,
      driver: {
        id: 'driver-trips',
        trips: [{ id: 'trip-1' }],
        occurrences: [],
        settlements: [],
        assignments: [],
      },
      refreshTokens: [],
    });

    const res = await service.deleteUser('user-with-trips', { id: 'admin-id', role: Role.ADMIN });

    expect(res.action).toBe('SOFT_DEACTIVATED');
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-with-trips' },
      data: { status: 'INACTIVE' },
    });
    expect(mockPrisma.user.delete).not.toHaveBeenCalled();
  });
});
