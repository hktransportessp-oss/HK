import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findSettlementsForDriver(driverId: string) {
    return this.prisma.financialSettlement.findMany({
      where: driverId ? { driverId } : {},
      include: {
        trip: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSettlementById(id: string) {
    const settlement = await this.prisma.financialSettlement.findUnique({
      where: { id },
      include: {
        driver: { include: { user: true } },
        trip: true,
        items: true,
        payments: true,
      },
    });

    if (!settlement) {
      throw new NotFoundException(`Fechamento financeiro com ID ${id} não encontrado`);
    }

    return settlement;
  }

  async findPaymentsForDriver(driverId: string) {
    return this.prisma.payment.findMany({
      where: driverId
        ? { settlement: { driverId } }
        : {},
      include: {
        settlement: true,
      },
      orderBy: { paymentDate: 'desc' },
    });
  }
}
