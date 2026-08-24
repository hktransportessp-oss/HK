import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABC-1234' })
  @IsString()
  @IsNotEmpty()
  plate: string;

  @ApiProperty({ example: 'FH 540' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: 'Volvo' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  @IsInt()
  @Min(1990)
  @Max(2030)
  year?: number;

  @ApiPropertyOptional({ example: 'DISPONIVEL' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'uuid-do-motorista' })
  @IsOptional()
  @IsString()
  driverId?: string;
}

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'FH 540 Globetrotter' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 'Volvo' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: 'DISPONIVEL' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'uuid-do-motorista' })
  @IsOptional()
  @IsString()
  driverId?: string;
}
