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

export class ReceiptPayloadDto {
  @ApiProperty({ example: 'RCP-2026-08-001', description: 'ID do comprovante no ERP' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({ example: 'TOLL', description: 'TOLL, EXPENSE, FUEL, POD, OCCURRENCE' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ example: 'uuid-toll-123', description: 'ID da entidade vinculada no sistema (pedágio, despesa, etc.)' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ example: 'https://storage.hktransportes.com.br/receipts/toll-1.jpg' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ example: 'https://storage.hktransportes.com.br/receipts/toll-1.jpg' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiPropertyOptional({ example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' })
  @IsOptional()
  @IsString()
  fileHash?: string;

  @ApiPropertyOptional({ example: 45.50 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ example: 'VERIFIED', description: 'PENDING, VERIFIED, REJECTED' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'Comprovante conferido e aprovado pelo financeiro' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: ErpDriverInfoDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ErpDriverInfoDto)
  driver?: ErpDriverInfoDto;
}

export class ErpReceiptWebhookDto {
  @ApiProperty({ example: 'evt_rcp_12345' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @ApiProperty({ example: 'receipt.verified' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ example: '2026-08-24T10:00:00.000Z' })
  @IsString()
  @IsNotEmpty()
  occurredAt: string;

  @ApiProperty({ type: ReceiptPayloadDto })
  @IsObject()
  @ValidateNested()
  @Type(() => ReceiptPayloadDto)
  data: ReceiptPayloadDto;
}
