import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { TripStatus, DeliveryStatus } from '@prisma/client';

describe('TripsService & Deliveries Lifecycle', () => {
  let service: TripsService;
  let prisma: PrismaService;

  const mockTrip = {
    id: 'trip-1',
    tripCode: 'TRIP-8849',
    driverId: 'driver-1',
    status: TripStatus.ASSIGNED,
    deliveries: [
      {
        id: 'del-1',
        tripId: 'trip-1',
        status: DeliveryStatus.PENDING,
        recipient: 'Cliente A',
      },
    ],
  };

  const mockPrisma = {
    trip: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    driverVehicleAssignment: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should list trips belonging only to the authenticated driver', async () => {
    mockPrisma.trip.findMany.mockResolvedValue([mockTrip]);
    const result = await service.findAllForDriver('driver-1');
    expect(result).toHaveLength(1);
    expect(mockPrisma.trip.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { driverId: 'driver-1' },
      }),
    );
  });

  it('should prevent driver from accessing another driver trip', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue(mockTrip);
    await expect(service.findOne('trip-1', 'driver-2')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should accept assigned trip', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue(mockTrip);
    mockPrisma.trip.update.mockResolvedValue({
      ...mockTrip,
      status: TripStatus.ACCEPTED,
    });

    const accepted = await service.acceptTrip('trip-1', 'driver-1');
    expect(accepted.status).toBe(TripStatus.ACCEPTED);
  });

  it('should handle idempotent accept trip call', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue({
      ...mockTrip,
      status: TripStatus.ACCEPTED,
    });

    const accepted = await service.acceptTrip('trip-1', 'driver-1');
    expect(accepted.status).toBe(TripStatus.ACCEPTED);
    expect(mockPrisma.trip.update).not.toHaveBeenCalled();
  });

  it('should start accepted trip', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue({
      ...mockTrip,
      status: TripStatus.ACCEPTED,
    });
    mockPrisma.trip.update.mockResolvedValue({
      ...mockTrip,
      status: TripStatus.IN_PROGRESS,
    });

    const started = await service.startTrip('trip-1', 'driver-1');
    expect(started.status).toBe(TripStatus.IN_PROGRESS);
  });

  it('should prevent completing trip if deliveries are pending', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue({
      ...mockTrip,
      status: TripStatus.IN_PROGRESS,
      deliveries: [
        { id: 'del-1', status: DeliveryStatus.PENDING },
      ],
    });

    await expect(service.completeTrip('trip-1', 'driver-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should complete trip when all deliveries are in terminal states', async () => {
    mockPrisma.trip.findUnique.mockResolvedValue({
      ...mockTrip,
      status: TripStatus.IN_PROGRESS,
      deliveries: [
        { id: 'del-1', status: DeliveryStatus.DELIVERED },
        { id: 'del-2', status: DeliveryStatus.REFUSED },
      ],
    });
    mockPrisma.trip.update.mockResolvedValue({
      ...mockTrip,
      status: TripStatus.COMPLETED,
    });

    const completed = await service.completeTrip('trip-1', 'driver-1');
    expect(completed.status).toBe(TripStatus.COMPLETED);
  });

  it('should maintain independent status when two trips are in progress and only one is completed', async () => {
    const tripA = {
      id: 'trip-A',
      tripCode: 'TRIP-1001',
      driverId: 'driver-1',
      status: TripStatus.IN_PROGRESS,
      deliveries: [{ id: 'del-A', status: DeliveryStatus.DELIVERED }],
    };

    const tripB = {
      id: 'trip-B',
      tripCode: 'TRIP-1002',
      driverId: 'driver-1',
      status: TripStatus.IN_PROGRESS,
      deliveries: [{ id: 'del-B', status: DeliveryStatus.DELIVERED }],
    };

    // Mock findUnique to return the specific trip requested
    mockPrisma.trip.findUnique.mockImplementation(({ where }: { where: { id: string } }) => {
      if (where.id === 'trip-A') return Promise.resolve(tripA);
      if (where.id === 'trip-B') return Promise.resolve(tripB);
      return Promise.resolve(null);
    });

    // Mock update to only update the targeted trip
    mockPrisma.trip.update.mockImplementation(({ where, data }: { where: { id: string }, data: { status: TripStatus } }) => {
      if (where.id === 'trip-A') {
        return Promise.resolve({ ...tripA, status: data.status });
      }
      if (where.id === 'trip-B') {
        return Promise.resolve({ ...tripB, status: data.status });
      }
      return Promise.resolve(null);
    });

    // Complete only trip-A
    const completedA = await service.completeTrip('trip-A', 'driver-1');

    expect(completedA.id).toBe('trip-A');
    expect(completedA.status).toBe(TripStatus.COMPLETED);

    // Verify trip-B was not updated and remains IN_PROGRESS
    expect(mockPrisma.trip.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.trip.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'trip-A' },
        data: expect.objectContaining({ status: TripStatus.COMPLETED }),
      }),
    );
  });
});
