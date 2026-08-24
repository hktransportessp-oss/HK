import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettlementItemDto {
  @ApiProperty({ example: 'Frete Base Viagem #TRIP-1029' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'FREIGHT', description: 'CREDIT, DEBIT, FREIGHT, TOLL, BONUS, DISCOUNT' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 4500.0 })
  @IsNumber()
  amount: number;
}

export class SettlementEventDto {
  @ApiPropertyOptional({ example: 'evt_settlement_92819' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiProperty({ example: 'SETTL-2026-08-001', description: 'Código único do fechamento no ERP' })
  @IsString()
  @IsNotEmpty()
  settlementCode: string;

  @ApiPropertyOptional({ example: '38920184910', description: 'CPF do motorista para vinculação' })
  @IsOptional()
  @IsString()
  driverCpf?: string;

  @ApiPropertyOptional({ description: 'ID interno do motorista no banco HK' })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional({ example: 'TRIP-1029', description: 'Código ou ID da viagem associada' })
  @IsOptional()
  @IsString()
  tripCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiProperty({ example: '2026-08-01' })
  @IsString()
  @IsNotEmpty()
  periodStart: string;

  @ApiProperty({ example: '2026-08-15' })
  @IsString()
  @IsNotEmpty()
  periodEnd: string;

  @ApiPropertyOptional({ example: 5000.0 })
  @IsOptional()
  @IsNumber()
  freightAmount?: number;

  @ApiPropertyOptional({ example: 350.0 })
  @IsOptional()
  @IsNumber()
  tollAmount?: number;

  @ApiPropertyOptional({ example: 200.0 })
  @IsOptional()
  @IsNumber()
  additionalAmount?: number;

  @ApiPropertyOptional({ example: 150.0 })
  @IsOptional()
  @IsNumber()
  deductionsAmount?: number;

  @ApiPropertyOptional({ example: 5400.0 })
  @IsOptional()
  @IsNumber()
  netAmount?: number;

  @ApiPropertyOptional({ example: 'APPROVED', description: 'PENDING, APPROVED, PAID, CANCELLED' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: [SettlementItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettlementItemDto)
  items?: SettlementItemDto[];
}
