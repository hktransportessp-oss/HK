import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  calculateTrackingStatus,
  TRACKING_POLICY,
} from './config/tracking-policy.config';
import { TripStatus } from '@prisma/client';

@Injectable()
export class AdminTrackingService {
  private readonly logger = new Logger(AdminTrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna a última posição de todos os motoristas cadastrados
   */
  async getAllDriversLastLocations(filters?: {
    status?: string;
    inTrip?: string;
    search?: string;
  }) {
    const drivers = await this.prisma.driver.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
            status: true,
          },
        },
        assignments: {
          where: { isCurrent: true },
          include: { vehicle: true },
          take: 1,
        },
        trips: {
          where: {
            status: { in: [TripStatus.IN_PROGRESS, TripStatus.ACCEPTED, TripStatus.ASSIGNED] },
          },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        lastLocation: true,
      },
    });

    const mapped = drivers.map((driver) => {
      const lastLoc = driver.lastLocation;
      const trackingStatus = calculateTrackingStatus(
        lastLoc?.capturedAt || null,
        lastLoc?.speed,
      );

      const activeTrip = driver.trips[0] || null;
      const currentVehicle = driver.assignments[0]?.vehicle || null;

      return {
        driverId: driver.id,
        driverName: driver.user?.name || `Motorista ${driver.id.substring(0, 8)}`,
        driverCpf: driver.user?.cpf || null,
        driverPhone: driver.user?.phone || null,
        userStatus: driver.user?.status || 'INACTIVE',
        vehicle: currentVehicle
          ? {
              id: currentVehicle.id,
              plate: currentVehicle.plate,
              model: currentVehicle.model,
              brand: currentVehicle.brand,
            }
          : null,
        activeTrip: activeTrip
          ? {
              id: activeTrip.id,
              tripCode: activeTrip.tripCode,
              origin: activeTrip.origin,
              destination: activeTrip.destination,
              status: activeTrip.status,
            }
          : null,
        lastLocation: lastLoc
          ? {
              latitude: lastLoc.latitude,
              longitude: lastLoc.longitude,
              accuracy: lastLoc.accuracy,
              speed: lastLoc.speed,
              heading: lastLoc.heading,
              capturedAt: lastLoc.capturedAt,
              receivedAt: lastLoc.receivedAt,
              tripId: lastLoc.tripId,
            }
          : null,
        trackingStatus,
      };
    });

    // Filtros em memória
    return mapped.filter((item) => {
      if (filters?.status && item.trackingStatus !== filters.status) {
        return false;
      }
      if (filters?.inTrip === 'true' && !item.activeTrip) {
        return false;
      }
      if (filters?.inTrip === 'false' && item.activeTrip) {
        return false;
      }
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        const matchesName = item.driverName.toLowerCase().includes(s);
        const matchesPlate = item.vehicle?.plate.toLowerCase().includes(s);
        const matchesTrip = item.activeTrip?.tripCode.toLowerCase().includes(s);
        if (!matchesName && !matchesPlate && !matchesTrip) return false;
      }
      return true;
    });
  }

  /**
   * Retorna a última posição e detalhes operacionais de um motorista específico
   */
  async getDriverDetails(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      include: {
        user: true,
        assignments: {
          where: { isCurrent: true },
          include: { vehicle: true },
          take: 1,
        },
        trips: {
          where: {
            status: { in: [TripStatus.IN_PROGRESS, TripStatus.ACCEPTED, TripStatus.ASSIGNED] },
          },
          take: 1,
        },
        lastLocation: true,
      },
    });

    if (!driver) {
      throw new NotFoundException(`Motorista "${driverId}" não encontrado`);
    }

    const lastLoc = driver.lastLocation;
    const trackingStatus = calculateTrackingStatus(
      lastLoc?.capturedAt || null,
      lastLoc?.speed,
    );

    return {
      driverId: driver.id,
      driverName: driver.user?.name || `Motorista ${driver.id.substring(0, 8)}`,
      driverCpf: driver.user?.cpf || null,
      driverPhone: driver.user?.phone || null,
      cnh: driver.cnh,
      cnhCategory: driver.cnhCategory,
      vehicle: driver.assignments[0]?.vehicle || null,
      activeTrip: driver.trips[0] || null,
      lastLocation: lastLoc,
      trackingStatus,
    };
  }

  /**
   * Retorna o histórico de posições com janela temporal e amostragem inteligente
   */
  async getDriverHistory(
    driverId: string,
    query: { from?: string; to?: string; period?: string; limit?: number },
  ) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException(`Motorista "${driverId}" não encontrado`);
    }

    let startDate: Date;
    let endDate = query.to ? new Date(query.to) : new Date();

    if (query.from) {
      startDate = new Date(query.from);
    } else {
      // Períodos pré-definidos: 2h, 6h, 12h, 24h (default: 6h)
      const hours =
        query.period === '2h'
          ? 2
          : query.period === '12h'
          ? 12
          : query.period === '24h'
          ? 24
          : 6;
      startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);
    }

    const limit = Math.min(Number(query.limit) || 1000, 2000);

    const locations = await this.prisma.driverLocation.findMany({
      where: {
        driverId,
        capturedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { capturedAt: 'asc' },
      take: limit,
    });

    return {
      driverId,
      period: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
      totalPoints: locations.length,
      points: locations.map((loc) => ({
        id: loc.id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        speed: loc.speed,
        heading: loc.heading,
        accuracy: loc.accuracy,
        capturedAt: loc.capturedAt,
        tripId: loc.tripId,
      })),
    };
  }

  /**
   * Retorna apenas motoristas ativos (com viagem em andamento ou atualizados nos últimos 30 min)
   */
  async getActiveDrivers() {
    const cutoffDate = new Date(Date.now() - TRACKING_POLICY.OFFLINE_THRESHOLD_MS);

    const activeDrivers = await this.prisma.driver.findMany({
      where: {
        OR: [
          {
            trips: {
              some: {
                status: { in: [TripStatus.IN_PROGRESS, TripStatus.ACCEPTED] },
              },
            },
          },
          {
            lastLocation: {
              capturedAt: { gte: cutoffDate },
            },
          },
        ],
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        assignments: {
          where: { isCurrent: true },
          include: { vehicle: true },
          take: 1,
        },
        trips: {
          where: { status: { in: [TripStatus.IN_PROGRESS, TripStatus.ACCEPTED] } },
          take: 1,
        },
        lastLocation: true,
      },
    });

    return activeDrivers.map((d) => ({
      driverId: d.id,
      driverName: d.user?.name || `Motorista ${d.id.substring(0, 8)}`,
      driverPhone: d.user?.phone || null,
      vehicle: d.assignments[0]?.vehicle || null,
      activeTrip: d.trips[0] || null,
      lastLocation: d.lastLocation,
      trackingStatus: calculateTrackingStatus(
        d.lastLocation?.capturedAt || null,
        d.lastLocation?.speed,
      ),
    }));
  }
}
