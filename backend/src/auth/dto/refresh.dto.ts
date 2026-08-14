import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh Token JWT', example: 'eyJhbGciOiJIUzI1Ni...' })
  @IsNotEmpty({ message: 'O refresh_token é obrigatório' })
  @IsString()
  refresh_token: string;
}
