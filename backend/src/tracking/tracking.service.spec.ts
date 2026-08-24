import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from './tracking.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TrackingService', () => {
  let service: TrackingService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      driverLocation: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      driverLastLocation: {
        upsert: jest.fn(),
      },
      trip: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (arr) => {
        if (Array.isArray(arr)) {
          return Promise.all(arr);
        }
        return arr(mockPrisma);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('DRIVER autenticado deve enviar localização válida com sucesso', async () => {
    mockPrisma.driverLocation.findFirst.mockResolvedValue(null);
    mockPrisma.driverLocation.create.mockResolvedValue({
      id: 'loc-1',
      latitude: -23.5505,
      longitude: -46.6333,
      speed: 45.2,
      receivedAt: new Date(),
    });
    mockPrisma.driverLastLocation.upsert.mockResolvedValue({});

    const res = await service.recordLocation('driver-1', {
      latitude: -23.5505,
      longitude: -46.6333,
      accuracy: 10.0,
      speed: 45.2,
      heading: 180,
      capturedAt: new Date().toISOString(),
    });

    expect(res.success).toBe(true);
    expect(res.latitude).toBe(-23.5505);
    expect(mockPrisma.driverLocation.create).toHaveBeenCalled();
    expect(mockPrisma.driverLastLocation.upsert).toHaveBeenCalled();
  });

  it('deve rejeitar timestamp futuro com drift excessivo (> 5 min)', async () => {
    const futureDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await expect(
      service.recordLocation('driver-1', {
        latitude: -23.5505,
        longitude: -46.6333,
        capturedAt: futureDate,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve retornar 403 se a viagem informada pertencer a outro motorista', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue({
      id: 'trip-other',
      driverId: 'another-driver-id',
    });

    await expect(
      service.recordLocation('driver-1', {
        latitude: -23.5505,
        longitude: -46.6333,
        capturedAt: new Date().toISOString(),
        tripId: 'trip-other',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve ignorar duplicata exata de timestamp sem reescrever no banco', async () => {
    const nowIso = new Date().toISOString();
    mockPrisma.driverLocation.findFirst.mockResolvedValue({
      id: 'loc-existing',
      driverId: 'driver-1',
      capturedAt: new Date(nowIso),
    });

    const res = await service.recordLocation('driver-1', {
      latitude: -23.5505,
      longitude: -46.6333,
      capturedAt: nowIso,
    });

    expect(res.success).toBe(true);
    expect(res.duplicate).toBe(true);
    expect(mockPrisma.driverLocation.create).not.toHaveBeenCalled();
  });
});
