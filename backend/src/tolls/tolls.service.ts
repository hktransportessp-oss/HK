import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTollDto } from './dto/create-toll.dto';
import { TollStatus } from '@prisma/client';

@Injectable()
export class TollsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTollDto, driverId: string) {
    return this.prisma.toll.create({
      data: {
        tripId: dto.tripId || null,
        driverId: driverId,
        amount: dto.amount,
        date: dto.date,
        plaza: dto.plaza,
        highway: dto.highway,
        receiptUrl: dto.receiptUrl || null,
        notes: dto.notes,
        status: 'PENDING',
      },
      include: {
        receipts: true,
      },
    });
  }

  async findAllForDriver(driverId: string) {
    return this.prisma.toll.findMany({
      where: driverId ? { driverId } : {},
      include: {
        trip: true,
        receipts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const toll = await this.prisma.toll.findUnique({
      where: { id },
      include: {
        driver: { include: { user: true } },
        trip: true,
        receipts: true,
      },
    });

    if (!toll) {
      throw new NotFoundException(`Comprovante de pedágio com ID ${id} não encontrado`);
    }

    return toll;
  }

  async updateStatus(id: string, status: TollStatus) {
    const toll = await this.prisma.toll.findUnique({ where: { id } });
    if (!toll) {
      throw new NotFoundException(`Pedágio com ID ${id} não encontrado`);
    }

    return this.prisma.toll.update({
      where: { id },
      data: { status },
    });
  }
}
