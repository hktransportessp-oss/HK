import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRomaneioDto {
  @ApiProperty({ description: 'Código identificador do romaneio', example: 'ROM-2026-002' })
  @IsNotEmpty()
  @IsString()
  romaneioCode: string;

  @ApiProperty({ description: 'ID da viagem associada (opcional)', required: false })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiProperty({ description: 'Observações do romaneio', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
