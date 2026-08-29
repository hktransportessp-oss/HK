import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ErpInvoiceItemDto {
  @ApiPropertyOptional({ description: 'ID do registro no ERP' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({ description: 'Número da Nota Fiscal' })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiPropertyOptional({ description: 'Número da Nota Fiscal (EN)' })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({ description: 'Série da NF-e' })
  @IsOptional()
  @IsString()
  serie?: string;

  @ApiPropertyOptional({ description: 'Série da NF-e (EN)' })
  @IsOptional()
  @IsString()
  series?: string;

  @ApiPropertyOptional({ description: 'Chave de acesso de 44 dígitos da NF-e' })
  @IsOptional()
  @IsString()
  chaveNfe?: string;

  @ApiPropertyOptional({ description: 'Chave de acesso (EN)' })
  @IsOptional()
  @IsString()
  accessKey?: string;

  @ApiPropertyOptional({ description: 'Razão social / Nome do Emitente' })
  @IsOptional()
  @IsString()
  emitente?: string;

  @ApiPropertyOptional({ description: 'Nome do Emitente (EN)' })
  @IsOptional()
  @IsString()
  issuer?: string;

  @ApiProperty({ description: 'Destinatário / Cliente final' })
  @IsOptional()
  @IsString()
  destinatario?: string;

  @ApiPropertyOptional({ description: 'Destinatário (EN)' })
  @IsOptional()
  @IsString()
  recipient?: string;

  @ApiPropertyOptional({ description: 'CPF ou CNPJ do Destinatário' })
  @IsOptional()
  @IsString()
  cpfCnpjDestinatario?: string;

  @ApiPropertyOptional({ description: 'CPF/CNPJ do Destinatário (EN)' })
  @IsOptional()
  @IsString()
  recipientDocument?: string;

  @ApiProperty({ description: 'Endereço de entrega (Logradouro)' })
  @IsOptional()
  @IsString()
  enderecoEntrega?: string;

  @ApiPropertyOptional({ description: 'Endereço de entrega (EN)' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Número do endereço de entrega' })
  @IsOptional()
  @IsString()
  numeroEndereco?: string;

  @ApiPropertyOptional({ description: 'Número (EN)' })
  @IsOptional()
  @IsString()
  numberAddress?: string;

  @ApiPropertyOptional({ description: 'Complemento do endereço' })
  @IsOptional()
  @IsString()
  complemento?: string;

  @ApiPropertyOptional({ description: 'Complemento (EN)' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiPropertyOptional({ description: 'Bairro' })
  @IsOptional()
  @IsString()
  bairro?: string;

  @ApiPropertyOptional({ description: 'Bairro (EN)' })
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional({ description: 'Cidade' })
  @IsOptional()
  @IsString()
  cidade?: string;

  @ApiPropertyOptional({ description: 'Cidade (EN)' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Estado / UF (ex: SP)' })
  @IsOptional()
  @IsString()
  uf?: string;

  @ApiPropertyOptional({ description: 'UF (EN)' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'CEP de entrega' })
  @IsOptional()
  @IsString()
  cep?: string;

  @ApiPropertyOptional({ description: 'CEP (EN)' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Quantidade de volumes' })
  @IsOptional()
  @IsNumber()
  volumes?: number;

  @ApiPropertyOptional({ description: 'Quantidade de volumes (EN)' })
  @IsOptional()
  @IsNumber()
  volumeCount?: number;

  @ApiPropertyOptional({ description: 'Peso total em kg' })
  @IsOptional()
  @IsNumber()
  peso?: number;

  @ApiPropertyOptional({ description: 'Peso (EN)' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: 'Valor total dos produtos da NF-e' })
  @IsOptional()
  @IsNumber()
  valor?: number;

  @ApiPropertyOptional({ description: 'Valor (EN)' })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ description: 'Status Fiscal (ACTIVE, CANCELLED)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Status Fiscal' })
  @IsOptional()
  @IsString()
  fiscalStatus?: string;

  @ApiPropertyOptional({ description: 'URL para download do XML da NF-e' })
  @IsOptional()
  @IsString()
  xmlUrl?: string;

  @ApiPropertyOptional({ description: 'URL para download do PDF/DANFE da NF-e' })
  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @ApiPropertyOptional({ description: 'ID do cliente no ERP' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Nome do cliente no ERP' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Horário de início da janela de entrega' })
  @IsOptional()
  @IsString()
  deliveryWindowStart?: string;

  @ApiPropertyOptional({ description: 'Horário de término da janela de entrega' })
  @IsOptional()
  @IsString()
  deliveryWindowEnd?: string;

  @ApiPropertyOptional({ description: 'Observações operacionais ou de entrega' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({ description: 'Observações (alias)' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Metadados de importação de e-mail' })
  @IsOptional()
  emailRecord?: {
    providerMessageId?: string;
    threadId?: string;
    sender?: string;
    subject?: string;
    receivedAt?: string;
  };
}

export class ErpInvoiceSyncDto {
  @ApiPropertyOptional({ description: 'Evento do webhook (ex: invoice.created, invoice.updated, invoice.cancelled)' })
  @IsOptional()
  @IsString()
  event?: string;

  @ApiPropertyOptional({ description: 'Timestamp de emissão ou ocorrência' })
  @IsOptional()
  @IsString()
  occurredAt?: string;

  @ApiPropertyOptional({ description: 'Chave de idempotência do envelope' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  @ApiPropertyOptional({ description: 'Dados de uma única NF-e' })
  @IsOptional()
  @Type(() => ErpInvoiceItemDto)
  data?: ErpInvoiceItemDto;

  @ApiPropertyOptional({ description: 'Lote de NF-es para sincronização/backfill em massa' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ErpInvoiceItemDto)
  invoices?: ErpInvoiceItemDto[];
}
