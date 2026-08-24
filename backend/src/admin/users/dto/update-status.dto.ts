import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['ACTIVE', 'INACTIVE', 'BLOCKED'])
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}
