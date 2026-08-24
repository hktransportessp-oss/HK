import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdjustmentEventDto {
  @ApiPropertyOptional({ example: 'evt_adj_55412' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiProperty({ example: 'SETTL-2026-08-001', description: 'Código do fechamento financeiro' })
  @IsString()
  @IsNotEmpty()
  settlementCode: string;

  @ApiProperty({ example: 'Bônus Pontualidade Rota Expressa' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'BONUS', description: 'BONUS, DEDUCTION, TOLL, ADVANCE, FUEL_DISCOUNT' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  amount: number;
}
