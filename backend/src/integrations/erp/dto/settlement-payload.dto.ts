import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErpDriverInfoDto {
  @ApiPropertyOptional({ example: '12345678901', description: 'CPF do motorista para resolução determinística' })
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional({ description: 'ID interno do motorista no banco HK Central' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ example: 'João da Silva' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+5511999999999' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class ErpVehicleInfoDto {
  @ApiPropertyOptional({ example: 'ABC1D23' })
  @IsOptional()
  @IsString()
  plate?: string;

  @ApiPropertyOptional({ example: 'Scania R450' })
  @IsOptional()
  @IsString()
  model?: string;
}

export class SettlementItemPayloadDto {
  @ApiPropertyOptional({ example: 'ITEM-001' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiProperty({ example: 'Frete Base Viagem SP -> RJ' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'FREIGHT', description: 'FREIGHT, TOLL, BONUS, DISCOUNT, ADVANCE, DEBIT, CREDIT' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 4500.0 })
  @IsNumber()
  amount: number;
}

export class SettlementPayloadDto {
  @ApiProperty({ example: 'SETTL-2026-08-001', description: 'ID ou código do fechamento no ERP' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiPropertyOptional({ example: 'HK_ERP' })
  @IsOptional()
  @IsString()
  externalSource?: string;

  @ApiPropertyOptional({ description: 'ID interno já cadastrado no HK Central (se houver)' })
  @IsOptional()
  @IsString()
  internalId?: string;

  @ApiProperty({ type: ErpDriverInfoDto, description: 'Dados determinísticos do motorista' })
  @IsObject()
  @ValidateNested()
  @Type(() => ErpDriverInfoDto)
  driver: ErpDriverInfoDto;

  @ApiPropertyOptional({ type: ErpVehicleInfoDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ErpVehicleInfoDto)
  vehicle?: ErpVehicleInfoDto;

  @ApiProperty({ example: '2026-08-01' })
  @IsString()
  @IsNotEmpty()
  periodStart: string;

  @ApiProperty({ example: '2026-08-15' })
  @IsString()
  @IsNotEmpty()
  periodEnd: string;

  @ApiPropertyOptional({ example: '2026-08-20' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'APPROVED', description: 'PENDING, APPROVED, PAID, CANCELLED' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ type: [SettlementItemPayloadDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettlementItemPayloadDto)
  items: SettlementItemPayloadDto[];

  @ApiPropertyOptional({ example: 4850.0 })
  @IsOptional()
  @IsNumber()
  grossAmount?: number;

  @ApiPropertyOptional({ example: 400.0 })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiProperty({ example: 4450.0 })
  @IsNumber()
  netAmount: number;

  @ApiPropertyOptional({ example: 0.0 })
  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  version?: number;
}
