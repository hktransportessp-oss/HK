import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersService } from './admin-users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
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
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      vehicle: {
        findUnique: jest.fn(),
      },
      driverVehicleAssignment: {
        create: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      refreshToken: {
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
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

  it('ADMIN deve conseguir criar usuário com perfil DRIVER e vincular veículo', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user-1',
      name: 'João Silva',
      cpf: '12345678900',
      role: Role.DRIVER,
      status: 'ACTIVE',
    });
    mockPrisma.driver.findFirst.mockResolvedValue(null);
    mockPrisma.driver.create.mockResolvedValue({ id: 'driver-1', userId: 'user-1' });
    mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 'veh-1', plate: 'ABC-1234' });
    mockPrisma.driverVehicleAssignment.create.mockResolvedValue({ id: 'asgn-1' });

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'João Silva',
      cpf: '12345678900',
      role: Role.DRIVER,
      status: 'ACTIVE',
      passwordHash: 'hashed_password',
      driver: {
        id: 'driver-1',
        assignments: [{ isCurrent: true, vehicle: { id: 'veh-1', plate: 'ABC-1234' } }],
        trips: [],
      },
    });

    const res = await service.createUser(
      {
        name: 'João Silva',
        cpf: '123.456.789-00',
        password: 'Password#123',
        role: Role.DRIVER,
        vehicleId: 'veh-1',
      },
      { id: 'admin-id', role: Role.ADMIN },
    );

    expect(res.id).toBe('user-1');
    expect(res).not.toHaveProperty('passwordHash');
    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(mockPrisma.driver.create).toHaveBeenCalled();
    expect(mockPrisma.driverVehicleAssignment.create).toHaveBeenCalled();
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'USER_CREATED' }),
    );
  });

  it('MANAGER deve conseguir listar usuários', async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: 'u-1',
        name: 'Admin 1',
        cpf: '111',
        role: Role.ADMIN,
        passwordHash: 'secret',
        driver: null,
      },
      {
        id: 'u-2',
        name: 'Motorista 2',
        cpf: '222',
        role: Role.DRIVER,
        passwordHash: 'secret2',
        driver: { assignments: [] },
      },
    ]);

    const res = await service.listUsers();
    expect(res).toHaveLength(2);
    expect(res[0]).not.toHaveProperty('passwordHash');
    expect(res[1]).not.toHaveProperty('passwordHash');
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
  });

  it('MANAGER NÃO pode criar usuário com perfil ADMIN (ForbiddenException)', async () => {
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
      cnh: '12345',
      cnhCategory: 'E',
      rntrc: '999',
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
      passwordHash: 'hash',
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
      data: expect.objectContaining({
        userId: 'user-3',
        status: 'ATIVO',
      }),
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
    expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-with-trips', isRevoked: false },
      data: { isRevoked: true },
    });
    expect(mockPrisma.user.delete).not.toHaveBeenCalled();
  });

  it('exclusão de usuário sem histórico operacional deve remover fisicamente', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-fresh',
      role: Role.DRIVER,
      driver: {
        id: 'driver-fresh',
        trips: [],
        occurrences: [],
        settlements: [],
        assignments: [],
      },
      refreshTokens: [],
    });

    const res = await service.deleteUser('user-fresh', { id: 'admin-id', role: Role.ADMIN });

    expect(res.action).toBe('DELETED');
    expect(mockPrisma.driver.delete).toHaveBeenCalledWith({ where: { id: 'driver-fresh' } });
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-fresh' } });
  });

  it('deve retornar métricas corretas no dashboard stats', async () => {
    mockPrisma.user.count = jest.fn()
      .mockResolvedValueOnce(15) // totalUsers
      .mockResolvedValueOnce(12) // activeUsers
      .mockResolvedValueOnce(3); // inactiveUsers
    mockPrisma.driver.count = jest.fn()
      .mockResolvedValueOnce(10) // totalDrivers
      .mockResolvedValueOnce(2); // erpOnlyDrivers
    mockPrisma.vehicle.count = jest.fn().mockResolvedValueOnce(8); // totalVehicles

    const stats = await service.getDashboardStats();

    expect(stats).toEqual({
      totalUsers: 15,
      activeUsers: 12,
      inactiveUsers: 3,
      totalDrivers: 10,
      erpOnlyDrivers: 2,
      totalVehicles: 8,
    });
  });

  it('deve listar motoristas ERP_ONLY sem usuário vinculado', async () => {
    mockPrisma.driver.findMany = jest.fn().mockResolvedValue([
      { id: 'drv-erp-1', cnh: '12345678900', userId: null, trips: [] },
    ]);

    const res = await service.getUnlinkedDrivers();

    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('drv-erp-1');
    expect(mockPrisma.driver.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: null } }),
    );
  });
});
