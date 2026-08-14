import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOccurrenceDto {
  @ApiProperty({ description: 'ID da viagem', example: 'uuid-da-viagem' })
  @IsNotEmpty({ message: 'O ID da viagem é obrigatório' })
  @IsString()
  tripId: string;

  @ApiProperty({ description: 'ID da entrega (opcional)', required: false })
  @IsOptional()
  @IsString()
  deliveryId?: string;

  @ApiProperty({
    description: 'Tipo da ocorrência',
    example: 'DELIVERY_REFUSED',
  })
  @IsNotEmpty({ message: 'O tipo da ocorrência é obrigatório' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Título da ocorrência', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Descrição detalhada da ocorrência' })
  @IsNotEmpty({ message: 'A descrição da ocorrência é obrigatória' })
  @IsString()
  description: string;
}
