import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenericEventDto {
  @ApiPropertyOptional({ example: 'evt_gen_88412' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiProperty({ example: 'settlement.approved', description: 'Tipo do evento enviado pelo ERP' })
  @IsString()
  @IsNotEmpty()
  eventType: string;

  @ApiPropertyOptional({ example: '2026-08-24T02:45:00.000Z' })
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiProperty({ description: 'Dados estruturados do payload do evento', example: { settlementCode: 'SETTL-001', status: 'APPROVED' } })
  @IsObject()
  payload: Record<string, any>;
}
