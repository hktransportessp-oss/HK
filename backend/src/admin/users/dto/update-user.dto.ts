import {
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Carlos Alberto Silva' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+5511999998888' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.DRIVER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 'ACTIVE', description: 'ACTIVE | INACTIVE | BLOCKED' })
  @IsOptional()
  @IsString()
  status?: string;

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

  @ApiPropertyOptional({ example: 'uuid-do-motorista' })
  @IsOptional()
  @IsString()
  driverId?: string;
}
