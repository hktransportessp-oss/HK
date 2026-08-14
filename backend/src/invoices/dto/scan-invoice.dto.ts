import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class ScanInvoiceDto {
  @ApiProperty({
    description: 'Chave de acesso da NF-e (44 dígitos numéricos)',
    example: '35240812345678000190550010000012341234567890',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{44}$/, {
    message: 'A chave de acesso da NF-e deve ter exatamente 44 dígitos numéricos.',
  })
  accessKey: string;

  @ApiPropertyOptional({
    description: 'UUID da viagem à qual a NF-e será vinculada',
  })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiPropertyOptional({
    description: 'Chave de idempotência para evitar duplicidade na requisição',
  })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
