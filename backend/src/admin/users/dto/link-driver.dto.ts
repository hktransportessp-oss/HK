import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LinkDriverDto {
  @ApiPropertyOptional({ example: 'uuid-do-motorista', description: 'ID do Driver a ser vinculado ao usuário (ou null/vazio para desvincular)' })
  @IsOptional()
  @IsString()
  driverId?: string | null;
}
