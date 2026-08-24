import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TollStatus } from '@prisma/client';

export class TollEventDto {
  @ApiPropertyOptional({ example: 'evt_toll_77182' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiPropertyOptional({ description: 'ID do pedágio no banco HK Central' })
  @IsOptional()
  @IsString()
  tollId?: string;

  @ApiPropertyOptional({ description: 'ID da viagem vinculada' })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiPropertyOptional({ description: 'CPF do motorista para vinculação' })
  @IsOptional()
  @IsString()
  driverCpf?: string;

  @ApiPropertyOptional({ description: 'ID do motorista no banco HK' })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional({ example: 42.8 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ example: '2026-08-14' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: 'Pedágio Km 180 - Via Anhanguera' })
  @IsOptional()
  @IsString()
  plaza?: string;

  @ApiPropertyOptional({ example: 'SP-330' })
  @IsOptional()
  @IsString()
  highway?: string;

  @ApiPropertyOptional({ example: 'https://storage.hktransportes.com.br/tolls/pedagio-123.pdf' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiProperty({ example: 'APPROVED', enum: TollStatus, description: 'PENDING, APPROVED, REJECTED' })
  @IsEnum(TollStatus)
  status: TollStatus;

  @ApiPropertyOptional({ example: 'Reembolso aprovado pelo ERP Financeiro' })
  @IsOptional()
  @IsString()
  notes?: string;
}
