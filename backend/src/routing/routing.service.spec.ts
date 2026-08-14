import { RouteOptimizationService } from './route-optimization.service';
import { PrismaService } from '../prisma/prisma.service';
import { GeocodingService } from './geocoding.service';

describe('RouteOptimizationService (Fase 5 - Roteirização Inteligente)', () => {
  let service: RouteOptimizationService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      trip: {
        findUnique: jest.fn(),
      },
      delivery: {
        update: jest.fn().mockResolvedValue({}),
      },
    } as unknown as PrismaService;

    const geocodingService = {
      geocodeAddress: jest.fn().mockResolvedValue({
        latitude: -23.55052,
        longitude: -46.633308,
        status: 'CONFIRMED',
      }),
    } as unknown as GeocodingService;

    service = new RouteOptimizationService(prisma, geocodingService);
  });

  it('deve priorizar janela de atendimento de cliente distante sobre cliente próximo sem restrição', async () => {
    const mockTrip = {
      id: 'trip-fase5-test',
      driverId: 'driver-123',
      deliveries: [
        {
          id: 'deliv-1',
          recipient: 'Cliente A (Urgente - Fecha 10:00)',
          customerName: 'Cliente A',
          address: 'Av Paulista 1000',
          city: 'São Paulo',
          state: 'SP',
          latitude: -23.5615,
          longitude: -46.6559, // 10 km de distância
          volumeCount: 15,
          deliveryWindowStart: '08:00',
          deliveryWindowEnd: '10:00', // JANELA RESTRITA
          status: 'PENDING',
          invoices: [{ volumeCount: 15 }],
        },
        {
          id: 'deliv-2',
          recipient: 'Cliente B (Livre até 18:00)',
          customerName: 'Cliente B',
          address: 'Rua Augusta 500',
          city: 'São Paulo',
          state: 'SP',
          latitude: -23.5515,
          longitude: -46.6380, // 2 km de distância (mais perto)
          volumeCount: 8,
          deliveryWindowStart: '08:00',
          deliveryWindowEnd: '18:00', // JANELA AMPLA
          status: 'PENDING',
          invoices: [{ volumeCount: 8 }],
        },
        {
          id: 'deliv-3',
          recipient: 'Cliente C',
          customerName: 'Cliente C',
          address: 'Rua Vergueiro 1200',
          city: 'São Paulo',
          state: 'SP',
          latitude: -23.5700,
          longitude: -46.6400,
          volumeCount: 20,
          deliveryWindowStart: '08:00',
          deliveryWindowEnd: '17:00',
          status: 'PENDING',
          invoices: [{ volumeCount: 20 }],
        },
        {
          id: 'deliv-4',
          recipient: 'Cliente D (Recebe até 11:00)',
          customerName: 'Cliente D',
          address: 'Av Faria Lima 2000',
          city: 'São Paulo',
          state: 'SP',
          latitude: -23.5800,
          longitude: -46.6800,
          volumeCount: 12,
          deliveryWindowStart: '08:00',
          deliveryWindowEnd: '11:00', // OUTRA JANELA RESTRITA
          status: 'PENDING',
          invoices: [{ volumeCount: 12 }],
        },
        {
          id: 'deliv-5',
          recipient: 'Cliente E',
          customerName: 'Cliente E',
          address: 'Av Berrini 500',
          city: 'São Paulo',
          state: 'SP',
          latitude: -23.6000,
          longitude: -46.6900,
          volumeCount: 30,
          deliveryWindowStart: '08:00',
          deliveryWindowEnd: '18:00',
          status: 'PENDING',
          invoices: [{ volumeCount: 30 }],
        },
      ],
    };

    (prisma.trip.findUnique as jest.Mock).mockResolvedValue(mockTrip);

    const route = await service.optimizeTripRoute('trip-fase5-test', 'driver-123');

    expect(route).toBeDefined();
    expect(route.stops.length).toBe(5);

    // Confirm that Cliente A (closing at 10:00) is scheduled before Cliente B (closing at 18:00)
    const seqClienteA = route.stops.find((s) => s.deliveryId === 'deliv-1')?.sequence;
    const seqClienteB = route.stops.find((s) => s.deliveryId === 'deliv-2')?.sequence;

    expect(seqClienteA).toBeLessThan(seqClienteB!);
  });
});
