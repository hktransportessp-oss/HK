import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async findSettlementsForDriver(driverId: string) {
    if (!driverId) return [];
    return this.prisma.financialSettlement.findMany({
      where: { driverId },
      include: {
        trip: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSettlementById(id: string, driverId?: string) {
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

    if (driverId && settlement.driverId !== driverId) {
      throw new ForbiddenException('Acesso negado: este extrato financeiro pertence a outro motorista');
    }

    return settlement;
  }

  async findPaymentsForDriver(driverId: string) {
    if (!driverId) return [];
    return this.prisma.payment.findMany({
      where: { settlement: { driverId } },
      include: {
        settlement: true,
      },
      orderBy: { paymentDate: 'desc' },
    });
  }
}
