import {
  IsString,
  IsNotEmpty,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SettlementPayloadDto } from './settlement-payload.dto';

export class ErpWebhookEnvelopeDto<T = any> {
  @ApiProperty({ example: 'evt_settl_982173491823', description: 'Chave única de idempotência do evento' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @ApiProperty({ example: 'settlement.created', description: 'Tipo do evento emitido pelo ERP' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ example: '2026-08-24T10:00:00.000Z', description: 'Data/Hora ISO-8601 da ocorrência' })
  @IsString()
  @IsNotEmpty()
  occurredAt: string;

  @ApiProperty({ description: 'Payload estruturado do evento' })
  @IsObject()
  data: T;
}

export class ErpSettlementWebhookDto {
  @ApiProperty({ example: 'evt_settl_982173491823' })
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @ApiProperty({ example: 'settlement.created', enum: ['settlement.created', 'settlement.updated'] })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ example: '2026-08-24T10:00:00.000Z' })
  @IsString()
  @IsNotEmpty()
  occurredAt: string;

  @ApiProperty({ type: SettlementPayloadDto })
  @IsObject()
  @ValidateNested()
  @Type(() => SettlementPayloadDto)
  data: SettlementPayloadDto;
}
