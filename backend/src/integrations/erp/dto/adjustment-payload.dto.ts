import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErpDriverInfoDto } from './settlement-payload.dto';

export class AdjustmentPayloadDto {
  @ApiProperty({ example: 'ADJ-2026-08-001', description: 'ID do ajuste financeiro no ERP' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiPropertyOptional({ example: 'SETTL-2026-08-001', description: 'ID ou código do fechamento vinculado' })
  @IsOptional()
  @IsString()
  settlementId?: string;

  @ApiProperty({ example: 'Bônus por pontualidade na rota SP -> RJ' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'BONUS', description: 'BONUS, DISCOUNT, TOLL, ADVANCE, DEBIT, CREDIT' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ type: ErpDriverInfoDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ErpDriverInfoDto)
  driver?: ErpDriverInfoDto;
}

export class ErpAdjustmentWebhookDto {
  @ApiProperty({ example: 'evt_adj_99123' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @ApiProperty({ example: 'adjustment.created' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ example: '2026-08-24T10:00:00.000Z' })
  @IsString()
  @IsNotEmpty()
  occurredAt: string;

  @ApiProperty({ type: AdjustmentPayloadDto })
  @IsObject()
  @ValidateNested()
  @Type(() => AdjustmentPayloadDto)
  data: AdjustmentPayloadDto;
}
