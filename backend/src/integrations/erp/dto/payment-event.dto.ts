import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentEventDto {
  @ApiPropertyOptional({ example: 'evt_pay_99210' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiPropertyOptional({ description: 'ID interno do pagamento ou ID do ERP' })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiProperty({ example: 'SETTL-2026-08-001', description: 'Código do fechamento financeiro no ERP' })
  @IsString()
  @IsNotEmpty()
  settlementCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  settlementId?: string;

  @ApiProperty({ example: 5400.0 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: '2026-08-16T14:30:00.000Z' })
  @IsOptional()
  @IsString()
  paymentDate?: string;

  @ApiPropertyOptional({ example: 'PIX', description: 'PIX, TED, TRANSFERENCIA, DINHEIRO' })
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
