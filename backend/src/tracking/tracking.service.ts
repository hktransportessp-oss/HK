import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DriverLocationDto } from './dto/driver-location.dto';
import { TRACKING_POLICY } from '../admin/tracking/config/tracking-policy.config';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra uma nova coordenada GPS capturada pelo app Android do motorista autenticado
   */
  async recordLocation(driverId: string, dto: DriverLocationDto) {
    if (!driverId) {
      throw new BadRequestException('Usuário autenticado não possui motorista vinculado');
    }

    const capturedDate = new Date(dto.capturedAt);
    if (isNaN(capturedDate.getTime())) {
      throw new BadRequestException('Data/hora de captura com formato ISO inválido');
    }

    const now = Date.now();
    // Rejeitar timestamp absurdo no futuro (drift > 5min)
    if (capturedDate.getTime() > now + TRACKING_POLICY.MAX_FUTURE_TIMESTAMP_MS) {
      throw new BadRequestException('Timestamp no futuro rejeitado por política de segurança temporal');
    }

    // Rejeitar posições excessivamente antigas fora da política de retenção (30 dias)
    if (capturedDate.getTime() < now - TRACKING_POLICY.MAX_PAST_TIMESTAMP_MS) {
      throw new BadRequestException('Posição capturada fora da janela de aceitação (máximo 30 dias)');
    }

    // Validação de vínculo de viagem (se informado)
    let validatedTripId: string | null = null;
    if (dto.tripId) {
      const trip = await this.prisma.trip.findUnique({
        where: { id: dto.tripId },
      });

      if (!trip) {
        throw new NotFoundException(`Viagem "${dto.tripId}" não encontrada`);
      }

      if (trip.driverId !== driverId) {
        throw new ForbiddenException('A viagem informada não pertence ao motorista autenticado');
      }

      validatedTripId = trip.id;
    }

    // Detecção de duplicatas exatas de timestamp/motorista
    const existingPosition = await this.prisma.driverLocation.findFirst({
      where: {
        driverId,
        capturedAt: capturedDate,
      },
    });

    if (existingPosition) {
      this.logger.debug(`[Tracking] Posição duplicada ignorada para motorista ${driverId} em ${dto.capturedAt}`);
      return {
        success: true,
        acknowledged: true,
        duplicate: true,
        locationId: existingPosition.id,
      };
    }

    const receivedAt = new Date();

    // Persistência em lote atômico: histórico + última posição
    const [location] = await this.prisma.$transaction([
      this.prisma.driverLocation.create({
        data: {
          driverId,
          tripId: validatedTripId,
          latitude: dto.latitude,
          longitude: dto.longitude,
          accuracy: dto.accuracy !== undefined ? dto.accuracy : null,
          speed: dto.speed !== undefined ? dto.speed : null,
          heading: dto.heading !== undefined ? dto.heading : null,
          capturedAt: capturedDate,
          receivedAt,
        },
      }),
      this.prisma.driverLastLocation.upsert({
        where: { driverId },
        update: {
          tripId: validatedTripId,
          latitude: dto.latitude,
          longitude: dto.longitude,
          accuracy: dto.accuracy !== undefined ? dto.accuracy : null,
          speed: dto.speed !== undefined ? dto.speed : null,
          heading: dto.heading !== undefined ? dto.heading : null,
          capturedAt: capturedDate,
          receivedAt,
        },
        create: {
          driverId,
          tripId: validatedTripId,
          latitude: dto.latitude,
          longitude: dto.longitude,
          accuracy: dto.accuracy !== undefined ? dto.accuracy : null,
          speed: dto.speed !== undefined ? dto.speed : null,
          heading: dto.heading !== undefined ? dto.heading : null,
          capturedAt: capturedDate,
          receivedAt,
        },
      }),
    ]);

    return {
      success: true,
      locationId: location.id,
      driverId,
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed,
      receivedAt: location.receivedAt,
    };
  }
}
