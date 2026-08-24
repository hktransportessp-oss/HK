import { Test, TestingModule } from '@nestjs/testing';
import { AdminVehiclesService } from './admin-vehicles.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('AdminVehiclesService', () => {
  let service: AdminVehiclesService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(async () => {
    mockPrisma = {
      vehicle: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      driver: {
        findUnique: jest.fn(),
      },
      driverVehicleAssignment: {
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (cb) => {
        return cb(mockPrisma);
      }),
    };

    mockAudit = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminVehiclesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<AdminVehiclesService>(AdminVehiclesService);
  });

  it('should list all vehicles', async () => {
    mockPrisma.vehicle.findMany.mockResolvedValue([
      { id: 'v1', plate: 'ABC-1234', model: 'FH 540', brand: 'Volvo', status: 'DISPONIVEL' },
    ]);

    const result = await service.listVehicles();
    expect(result).toHaveLength(1);
    expect(result[0].plate).toBe('ABC-1234');
    expect(mockPrisma.vehicle.findMany).toHaveBeenCalled();
  });

  it('should throw conflict exception if vehicle plate already exists', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue({ id: 'v1', plate: 'ABC-1234' });

    await expect(
      service.createVehicle(
        { plate: 'ABC-1234', model: 'FH 540', brand: 'Volvo' },
        { id: 'admin1', role: Role.ADMIN },
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('should successfully create a new vehicle', async () => {
    mockPrisma.vehicle.findUnique.mockResolvedValue(null);
    mockPrisma.vehicle.create.mockResolvedValue({
      id: 'v2',
      plate: 'XYZ-9876',
      model: 'Constellation',
      brand: 'VW',
      status: 'DISPONIVEL',
    });

    const result = await service.createVehicle(
      { plate: 'XYZ-9876', model: 'Constellation', brand: 'VW' },
      { id: 'admin1', role: Role.ADMIN },
    );

    expect(result.id).toBe('v2');
    expect(result.plate).toBe('XYZ-9876');
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'VEHICLE_CREATED' }),
    );
  });
});
