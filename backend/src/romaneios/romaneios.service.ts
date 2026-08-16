import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRomaneioDto } from './dto/create-romaneio.dto';
import { RomaneioStatus } from '@prisma/client';

@Injectable()
export class RomaneiosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRomaneioDto, driverId: string) {
    const existing = await this.prisma.romaneio.findUnique({
      where: { romaneioCode: dto.romaneioCode },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.romaneio.create({
      data: {
        romaneioCode: dto.romaneioCode,
        tripId: dto.tripId || null,
        driverId: driverId,
        notes: dto.notes,
        status: RomaneioStatus.PENDING,
      },
      include: {
        documents: true,
      },
    });
  }

  async findAllForDriver(driverId: string) {
    return this.prisma.romaneio.findMany({
      where: driverId ? { driverId } : {},
      include: {
        trip: true,
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const romaneio = await this.prisma.romaneio.findUnique({
      where: { id },
      include: {
        driver: { include: { user: true } },
        trip: true,
        documents: true,
      },
    });

    if (!romaneio) {
      throw new NotFoundException(`Romaneio com ID ${id} não encontrado`);
    }

    return romaneio;
  }

  async updateStatus(id: string, status: RomaneioStatus) {
    const romaneio = await this.prisma.romaneio.findUnique({ where: { id } });
    if (!romaneio) {
      throw new NotFoundException(`Romaneio com ID ${id} não encontrado`);
    }

    return this.prisma.romaneio.update({
      where: { id },
      data: { status },
    });
  }
}
