import {
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DriverLocationDto {
  @ApiProperty({ example: -23.55052, description: 'Latitude entre -90 e 90' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -46.633308, description: 'Longitude entre -180 e 180' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ example: 12.5, description: 'Precisão em metros (>= 0)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  accuracy?: number;

  @ApiPropertyOptional({ example: 45.2, description: 'Velocidade em km/h (>= 0)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  @ApiPropertyOptional({ example: 180, description: 'Direção/Heading em graus (0 a 360)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiProperty({ example: '2026-08-24T13:00:00.000Z', description: 'Data/hora ISO da captura no dispositivo' })
  @IsString()
  @IsNotEmpty()
  capturedAt: string;

  @ApiPropertyOptional({ example: 'uuid-da-viagem-em-andamento', description: 'ID da viagem ativa (opcional)' })
  @IsOptional()
  @IsString()
  tripId?: string;
}
