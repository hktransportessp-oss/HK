import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadPodDto {
  @ApiProperty({
    description: 'URL ou URI do comprovante digital de entrega (POD)',
    example: 'https://storage.hkconnect.com.br/pods/pod-del-101.jpg',
  })
  @IsNotEmpty({ message: 'A URL do comprovante (podUrl) é obrigatória' })
  @IsString({ message: 'A URL do comprovante deve ser uma string' })
  podUrl: string;

  @ApiPropertyOptional({
    description: 'Hash SHA-256 de integridade do arquivo do comprovante',
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  })
  @IsOptional()
  @IsString({ message: 'O hash do comprovante deve ser uma string' })
  podFileHash?: string;
}
