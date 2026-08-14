import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeocodingService } from './geocoding.service';

export interface RouteStopResult {
  sequence: number;
  deliveryId: string;
  customer: string;
  recipientDocument?: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceFromPreviousKm: number;
  durationFromPreviousMinutes: number;
  estimatedArrival: string;
  deliveryWindow: string;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  volumeCount: number;
  invoiceCount: number;
  status: string;
  warning: string | null;
}

export interface RouteOptimizationResponse {
  routeId: string;
  tripId: string;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  erpConnected: boolean;
  mapsProviderStatus: string;
  stops: RouteStopResult[];
}

@Injectable()
export class RouteOptimizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geocodingService: GeocodingService,
  ) {}

  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1.3 * 10) / 10; // Road distance factor 1.3
  }

  private timeStringToMinutes(timeStr?: string): number {
    if (!timeStr) return 18 * 60; // Default 18:00
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
    return (h || 0) * 60 + (m || 0);
  }

  private minutesToTimeString(minutes: number): string {
    const hrs = Math.floor(minutes / 60) % 24;
    const mins = Math.round(minutes % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  async optimizeTripRoute(
    tripId: string,
    driverId: string,
  ): Promise<RouteOptimizationResponse> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        deliveries: {
          include: { invoices: true },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Viagem com ID ${tripId} não encontrada.`);
    }

    if (trip.driverId !== driverId) {
      throw new ForbiddenException(
        'Acesso negado: Você não é o motorista desta viagem.',
      );
    }

    const erpConnected = Boolean(
      process.env.HK_ERP_API_URL && process.env.HK_ERP_API_KEY,
    );
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    const mapsProviderStatus = mapsKey
      ? 'CONECTADO GOOGLE MAPS PLATFORM'
      : 'AGUARDANDO CREDENCIAL GOOGLE MAPS';

    // 1. Geocode deliveries if lat/long is missing
    const activeDeliveries = await Promise.all(
      trip.deliveries.map(async (delivery) => {
        let lat = delivery.latitude;
        let lng = delivery.longitude;
        if (!lat || !lng) {
          const geo = await this.geocodingService.geocodeAddress(
            delivery.address,
            delivery.city,
            delivery.state,
          );
          lat = geo.latitude;
          lng = geo.longitude;
        }
        return {
          ...delivery,
          latitude: lat,
          longitude: lng,
        };
      }),
    );

    if (activeDeliveries.length === 0) {
      return {
        routeId: `route-${trip.id}`,
        tripId: trip.id,
        totalDistanceKm: 0,
        estimatedDurationMinutes: 0,
        erpConnected,
        mapsProviderStatus,
        stops: [],
      };
    }

    // 2. Optimization algorithm considering Delivery Windows
    // Start time assumed at 08:00 (480 minutes)
    const startTimeMinutes = 8 * 60; // 08:00 AM
    let currentLat = -23.55052; // Origin (e.g. Depot)
    let currentLon = -46.633308;

    const unvisited = [...activeDeliveries];
    const orderedStops: RouteStopResult[] = [];

    let accumulatedMinutes = startTimeMinutes;
    let totalDistanceKm = 0;
    let sequence = 1;

    while (unvisited.length > 0) {
      let bestIndex = -1;
      let bestScore = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const item = unvisited[i];
        const dist = this.calculateDistanceKm(
          currentLat,
          currentLon,
          item.latitude,
          item.longitude,
        );
        const travelMins = Math.round((dist / 40) * 60); // 40 km/h average city speed
        const arrivalMins = accumulatedMinutes + travelMins;

        const windowEndMins = this.timeStringToMinutes(
          item.deliveryWindowEnd || '18:00',
        );

        // Heavy penalty if arriving after customer closing window
        let penalty = 0;
        if (arrivalMins > windowEndMins) {
          penalty = (arrivalMins - windowEndMins) * 1000;
        }

        // Urgency: fewer remaining minutes before window closes means higher urgency (lower cost)
        const timeRemaining = windowEndMins - arrivalMins;

        // Combined cost score: smaller timeRemaining gets prioritized
        const score = dist + timeRemaining * 2 + penalty;

        if (score < bestScore) {
          bestScore = score;
          bestIndex = i;
        }
      }

      const nextItem = unvisited.splice(bestIndex, 1)[0];
      const dist = this.calculateDistanceKm(
        currentLat,
        currentLon,
        nextItem.latitude,
        nextItem.longitude,
      );
      const travelMins = Math.round((dist / 40) * 60);
      accumulatedMinutes += travelMins;
      totalDistanceKm += dist;

      const arrivalTimeStr = this.minutesToTimeString(accumulatedMinutes);
      const windowStart = nextItem.deliveryWindowStart || '08:00';
      const windowEnd = nextItem.deliveryWindowEnd || '18:00';
      const windowEndMins = this.timeStringToMinutes(windowEnd);

      let warning: string | null = null;
      if (accumulatedMinutes > windowEndMins) {
        warning = 'ALERTA CRÍTICO: Previsão de chegada após o horário de recebimento.';
      } else if (windowEndMins - accumulatedMinutes <= 30) {
        warning = `ATENÇÃO — Cliente recebe somente até ${windowEnd}`;
      }

      orderedStops.push({
        sequence,
        deliveryId: nextItem.id,
        customer: nextItem.customerName || nextItem.recipient,
        recipientDocument: nextItem.recipientDocument || undefined,
        address: `${nextItem.address}, ${nextItem.city} - ${nextItem.state}`,
        latitude: nextItem.latitude,
        longitude: nextItem.longitude,
        distanceFromPreviousKm: dist,
        durationFromPreviousMinutes: travelMins,
        estimatedArrival: arrivalTimeStr,
        deliveryWindow: `${windowStart}–${windowEnd}`,
        deliveryWindowStart: windowStart,
        deliveryWindowEnd: windowEnd,
        volumeCount: nextItem.volumeCount || nextItem.invoices.reduce((s, inv) => s + inv.volumeCount, 0),
        invoiceCount: nextItem.invoices.length || 1,
        status: nextItem.status,
        warning,
      });

      // Update sequence in DB
      await this.prisma.delivery.update({
        where: { id: nextItem.id },
        data: {
          sequence,
          optimizedSequence: sequence,
        },
      });

      // Add 15 minutes average dwell time per stop
      accumulatedMinutes += 15;
      currentLat = nextItem.latitude;
      currentLon = nextItem.longitude;
      sequence++;
    }

    const totalDurationMinutes = accumulatedMinutes - startTimeMinutes;

    return {
      routeId: `route-${trip.id}`,
      tripId: trip.id,
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
      estimatedDurationMinutes: totalDurationMinutes,
      erpConnected,
      mapsProviderStatus,
      stops: orderedStops,
    };
  }
}
