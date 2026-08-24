import { Test, TestingModule } from '@nestjs/testing';
import { AdminTrackingService } from './admin-tracking.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { TripStatus } from '@prisma/client';

describe('AdminTrackingService', () => {
  let service: AdminTrackingService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      driver: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      driverLocation: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminTrackingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AdminTrackingService>(AdminTrackingService);
  });

  it('deve listar motoristas com status EM_MOVIMENTO quando velocidade > 3km/h e recente', async () => {
    mockPrisma.driver.findMany.mockResolvedValue([
      {
        id: 'driver-1',
        user: { name: 'Carlos Motorista', cpf: '12345678901', phone: '11999998888', status: 'ACTIVE' },
        assignments: [{ isCurrent: true, vehicle: { id: 'v1', plate: 'ABC1D23', model: 'Scania R450', brand: 'Scania' } }],
        trips: [{ id: 'trip-1', tripCode: 'TRIP-100', origin: 'SP', destination: 'RJ', status: TripStatus.IN_PROGRESS }],
        lastLocation: {
          latitude: -23.5505,
          longitude: -46.6333,
          speed: 65.0,
          capturedAt: new Date(Date.now() - 60 * 1000), // 1 min atrás
        },
      },
    ]);

    const res = await service.getAllDriversLastLocations();
    expect(res).toHaveLength(1);
    expect(res[0].trackingStatus).toBe('EM_MOVIMENTO');
    expect(res[0].vehicle?.plate).toBe('ABC1D23');
    expect(res[0].activeTrip?.tripCode).toBe('TRIP-100');
  });

  it('deve classificar como OFFLINE quando última posição tiver mais de 30 min', async () => {
    mockPrisma.driver.findMany.mockResolvedValue([
      {
        id: 'driver-2',
        user: { name: 'Marcos Inativo', cpf: '98765432100', phone: null, status: 'ACTIVE' },
        assignments: [],
        trips: [],
        lastLocation: {
          latitude: -23.5505,
          longitude: -46.6333,
          speed: 0,
          capturedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 min atrás
        },
      },
    ]);

    const res = await service.getAllDriversLastLocations();
    expect(res).toHaveLength(1);
    expect(res[0].trackingStatus).toBe('OFFLINE');
  });

  it('deve retornar trilha histórica com período correto', async () => {
    mockPrisma.driver.findUnique.mockResolvedValue({ id: 'driver-1' });
    mockPrisma.driverLocation.findMany.mockResolvedValue([
      { id: '1', latitude: -23.55, longitude: -46.63, speed: 40, capturedAt: new Date() },
      { id: '2', latitude: -23.56, longitude: -46.64, speed: 50, capturedAt: new Date() },
    ]);

    const res = await service.getDriverHistory('driver-1', { period: '6h' });
    expect(res.driverId).toBe('driver-1');
    expect(res.totalPoints).toBe(2);
    expect(res.points).toHaveLength(2);
  });
});
