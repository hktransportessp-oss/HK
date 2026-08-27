import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyDriverProfile(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException('Perfil de motorista não encontrado para este usuário');
    }

    return driver;
  }

  async getMyCurrentVehicle(driverId: string) {
    if (!driverId) {
      throw new NotFoundException('Motorista não identificado na sessão');
    }

    const assignment = await this.prisma.driverVehicleAssignment.findFirst({
      where: {
        driverId,
        isCurrent: true,
      },
      include: {
        vehicle: true,
      },
    });

    if (!assignment || !assignment.vehicle) {
      throw new NotFoundException('Nenhum veículo vinculado atualmente ao motorista');
    }

    return {
      assignmentId: assignment.id,
      startAt: assignment.startAt,
      vehicle: assignment.vehicle,
    };
  }

  async updateLocation(driverId: string, data: {
    latitude: number;
    longitude: number;
    speed?: number;
    accuracy?: number;
    heading?: number;
    tripId?: string;
    capturedAt?: string;
  }) {
    if (!driverId) {
      throw new NotFoundException('Motorista não identificado na sessão');
    }

    const capturedDate = data.capturedAt ? new Date(data.capturedAt) : new Date();

    // Inserir no histórico de telemetria
    const location = await this.prisma.driverLocation.create({
      data: {
        driverId,
        tripId: data.tripId || null,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed ?? null,
        accuracy: data.accuracy ?? null,
        heading: data.heading ?? null,
        capturedAt: capturedDate,
      },
    });

    // Atualizar tabela de última posição do motorista
    await this.prisma.driverLastLocation.upsert({
      where: { driverId },
      create: {
        driverId,
        tripId: data.tripId || null,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed ?? null,
        accuracy: data.accuracy ?? null,
        heading: data.heading ?? null,
        capturedAt: capturedDate,
      },
      update: {
        tripId: data.tripId || null,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed ?? null,
        accuracy: data.accuracy ?? null,
        heading: data.heading ?? null,
        capturedAt: capturedDate,
        updatedAt: new Date(),
      },
    });

    return { success: true, locationId: location.id, timestamp: capturedDate.toISOString() };
  }
}
