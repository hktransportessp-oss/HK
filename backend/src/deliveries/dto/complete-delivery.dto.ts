import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeliveryStatus } from '@prisma/client';

export class CompleteDeliveryDto {
  @ApiProperty({
    description: 'Status final da entrega',
    enum: [DeliveryStatus.DELIVERED, DeliveryStatus.PARTIAL, DeliveryStatus.REFUSED],
    example: DeliveryStatus.DELIVERED,
  })
  @IsNotEmpty()
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiProperty({ description: 'Observações adicionais', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Motivo de recusa ou falta', required: false })
  @IsOptional()
  @IsString()
  refusalReason?: string;

  @ApiProperty({ description: 'Quantidade total prevista', required: false })
  @IsOptional()
  @IsInt()
  quantityExpected?: number;

  @ApiProperty({ description: 'Quantidade entregue', required: false })
  @IsOptional()
  @IsInt()
  quantityDelivered?: number;

  @ApiProperty({ description: 'Quantidade faltante', required: false })
  @IsOptional()
  @IsInt()
  quantityMissing?: number;
}
