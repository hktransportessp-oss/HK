import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReceiptEventDto {
  @ApiPropertyOptional({ example: 'evt_receipt_10293' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiProperty({ example: 'TOLL', description: 'TOLL, PAYMENT, POD, OCCURRENCE, EXPENSE' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ description: 'ID do registro associado (Toll ID, Payment ID, Delivery ID)' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({ example: 'https://storage.hktransportes.com.br/docs/comprovante-pedagio.jpg' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4e5f6...' })
  @IsOptional()
  @IsString()
  fileHash?: string;

  @ApiPropertyOptional({ example: 'Comprovante auditado e validado pelo financeiro ERP' })
  @IsOptional()
  @IsString()
  notes?: string;
}
