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

export class PaymentPayloadDto {
  @ApiProperty({ example: 'PAY-2026-08-001', description: 'ID do pagamento no ERP' })
  @IsString()
  @IsNotEmpty()
  externalId: string;

  @ApiProperty({ example: 'SETTL-2026-08-001', description: 'Código do fechamento financeiro associado' })
  @IsString()
  @IsNotEmpty()
  settlementCode: string;

  @ApiPropertyOptional({ description: 'ID interno do fechamento financeiro' })
  @IsOptional()
  @IsString()
  settlementId?: string;

  @ApiPropertyOptional({ type: ErpDriverInfoDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ErpDriverInfoDto)
  driver?: ErpDriverInfoDto;

  @ApiProperty({ example: 4450.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: '2026-08-16T14:30:00.000Z' })
  @IsOptional()
  @IsString()
  paymentDate?: string;

  @ApiPropertyOptional({ example: 'PIX', description: 'PIX, TED, TRANSFERENCIA, BOLETO' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'PAID', description: 'PAID, PENDING, PROCESSING, FAILED' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'E2026081614309817263548' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ example: 'https://storage.hktransportes.com.br/receipts/pix-20260816.pdf' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

export class ErpPaymentWebhookDto {
  @ApiProperty({ example: 'evt_pay_99210' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @ApiProperty({ example: 'payment.confirmed' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ example: '2026-08-24T10:00:00.000Z' })
  @IsString()
  @IsNotEmpty()
  occurredAt: string;

  @ApiProperty({ type: PaymentPayloadDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PaymentPayloadDto)
  data: PaymentPayloadDto;
}
