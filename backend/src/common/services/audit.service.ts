import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    actorUserId?: string | null;
    action: string;
    targetUserId?: string | null;
    metadata?: Record<string, any>;
    prismaClient?: any;
  }): Promise<void> {
    const db = params.prismaClient || this.prisma;
    try {
      await db.auditLog.create({
        data: {
          actorUserId: params.actorUserId || null,
          action: params.action,
          targetUserId: params.targetUserId || null,
          metadata: params.metadata ? (params.metadata as any) : undefined,
        },
      });
      this.logger.log(`[AUDIT] Action: ${params.action} | Actor: ${params.actorUserId || 'SYSTEM'} | Target: ${params.targetUserId || 'N/A'}`);
    } catch (error) {
      this.logger.error(`[AUDIT ERROR] Failed to record audit log for ${params.action}: ${(error as Error).message}`);
    }
  }
}
