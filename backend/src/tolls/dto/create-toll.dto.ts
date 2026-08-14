import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTollDto {
  @ApiProperty({ description: 'ID da viagem relacionada', required: false })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiProperty({ description: 'Valor do pedágio', example: 42.5 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Data do comprovante', example: '08/08/2026' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ description: 'Nome da praça de pedágio', example: 'Praça Regis Bittencourt KM 350' })
  @IsNotEmpty()
  @IsString()
  plaza: string;

  @ApiProperty({ description: 'Rodovia', example: 'BR-116' })
  @IsNotEmpty()
  @IsString()
  highway: string;

  @ApiProperty({ description: 'URL do comprovante/foto', required: false })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiProperty({ description: 'Observações adicionais', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
