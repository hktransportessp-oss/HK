import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RomaneioStatus } from '@prisma/client';

export class RomaneioDocumentEventDto {
  @ApiPropertyOptional({ example: 'NFE', description: 'NFE, CTE, CANHOTO, DECLARACAO' })
  @IsOptional()
  @IsString()
  documentType?: string;

  @ApiPropertyOptional({ example: '001928' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({ example: '35260812345678000199550010000019281000019281' })
  @IsOptional()
  @IsString()
  accessKey?: string;

  @ApiPropertyOptional({ example: 'https://storage.hktransportes.com.br/docs/nfe-1928.pdf' })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}

export class RomaneioEventDto {
  @ApiPropertyOptional({ example: 'evt_rom_19284' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiProperty({ example: 'ROM-2026-08-042', description: 'Código único do Romaneio de Carga' })
  @IsString()
  @IsNotEmpty()
  romaneioCode: string;

  @ApiPropertyOptional({ description: 'ID da viagem associada' })
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

  @ApiPropertyOptional({ example: 'APPROVED', enum: RomaneioStatus, description: 'PENDING, APPROVED, REJECTED' })
  @IsOptional()
  @IsEnum(RomaneioStatus)
  status?: RomaneioStatus;

  @ApiPropertyOptional({ example: 'Romaneio conferido e integrado via ERP HK' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [RomaneioDocumentEventDto] })
  @IsOptional()
  @IsArray()
  documents?: RomaneioDocumentEventDto[];
}
