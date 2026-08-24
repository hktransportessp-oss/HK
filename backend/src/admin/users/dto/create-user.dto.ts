import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Carlos Alberto Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123.456.789-01' })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiPropertyOptional({ example: '+5511999998888' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'SenhaForte#2026', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, example: Role.DRIVER, description: 'DRIVER | OPERATOR | MANAGER | ADMIN' })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({ example: 'ACTIVE', description: 'ACTIVE | INACTIVE | BLOCKED' })
  @IsOptional()
  @IsString()
  status?: string;

  // Campos específicos caso role === Role.DRIVER
  @ApiPropertyOptional({ example: '12345678900' })
  @IsOptional()
  @IsString()
  cnh?: string;

  @ApiPropertyOptional({ example: 'E' })
  @IsOptional()
  @IsString()
  cnhCategory?: string;

  @ApiPropertyOptional({ example: '12345678' })
  @IsOptional()
  @IsString()
  rntrc?: string;

  @ApiPropertyOptional({ example: 'uuid-do-veiculo' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ example: 'uuid-do-motorista-existente-ou-erp-only' })
  @IsOptional()
  @IsString()
  driverId?: string;
}
