import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTripDto {
  @ApiProperty({ description: 'Código único da viagem', example: 'TRIP-9901' })
  @IsNotEmpty({ message: 'O código da viagem é obrigatório' })
  @IsString()
  tripCode: string;

  @ApiProperty({ description: 'Origem da carga', example: 'São Paulo - SP' })
  @IsNotEmpty()
  @IsString()
  origin: string;

  @ApiProperty({ description: 'Destino da carga', example: 'Curitiba - PR' })
  @IsNotEmpty()
  @IsString()
  destination: string;

  @ApiProperty({ description: 'Observações adicionais', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
