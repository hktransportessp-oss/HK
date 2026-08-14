import { Test, TestingModule } from '@nestjs/testing';
import { DeliveriesService } from './deliveries.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeliveryStatus, TripStatus } from '@prisma/client';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('DeliveriesService', () => {
  let service: DeliveriesService;
  let prisma: PrismaService;

  const mockDelivery = {
    id: 'del-100',
    tripId: 'trip-100',
    recipient: 'Empresa Teste',
    status: DeliveryStatus.PENDING,
    trip: {
      id: 'trip-100',
      driverId: 'driver-1',
      status: TripStatus.IN_PROGRESS,
    },
    invoices: [],
  };

  const mockPrisma = {
    delivery: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    invoice: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DeliveriesService>(DeliveriesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should arrive at delivery location', async () => {
    mockPrisma.delivery.findUnique.mockResolvedValue(mockDelivery);
    mockPrisma.delivery.update.mockResolvedValue({
      ...mockDelivery,
      status: DeliveryStatus.ARRIVED,
    });

    const result = await service.arrive('del-100', 'driver-1');
    expect(result.status).toBe(DeliveryStatus.ARRIVED);
  });

  it('should prevent driver from arriving at another driver delivery', async () => {
    mockPrisma.delivery.findUnique.mockResolvedValue(mockDelivery);
    await expect(service.arrive('del-100', 'driver-other')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should complete delivery as DELIVERED', async () => {
    mockPrisma.delivery.findUnique.mockResolvedValue({
      ...mockDelivery,
      status: DeliveryStatus.ARRIVED,
    });
    mockPrisma.delivery.update.mockResolvedValue({
      ...mockDelivery,
      status: DeliveryStatus.DELIVERED,
    });

    const result = await service.complete(
      'del-100',
      { status: DeliveryStatus.DELIVERED },
      'driver-1',
    );
    expect(result.status).toBe(DeliveryStatus.DELIVERED);
  });

  it('should complete delivery as REFUSED requiring reason', async () => {
    mockPrisma.delivery.findUnique.mockResolvedValue({
      ...mockDelivery,
      status: DeliveryStatus.ARRIVED,
    });

    await expect(
      service.complete(
        'del-100',
        { status: DeliveryStatus.REFUSED },
        'driver-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
