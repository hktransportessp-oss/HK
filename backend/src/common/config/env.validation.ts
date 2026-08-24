import { Logger } from '@nestjs/common';

/**
 * HK Connect Backend - Environment Configuration & Validation
 * Build Version: 2026.08.24-v3
 * Purpose: Strict validation of required runtime secrets and environment variables
 */

export interface AppConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGIN?: string;
  ENABLE_SWAGGER?: boolean;
  ERP_API_KEY?: string;
  ERP_WEBHOOK_SECRET?: string;
  HK_ERP_API_KEY?: string;
  HK_ERP_API_URL?: string;
}

export function validateEnvironment(): AppConfig {
  const logger = new Logger('EnvValidation');

  // Diagnóstico seguro antes da validação estrita (sem expor valores sensíveis)
  console.log({
    DATABASE_URL_present: Boolean(process.env.DATABASE_URL),
    JWT_ACCESS_SECRET_present: Boolean(process.env.JWT_ACCESS_SECRET),
    JWT_REFRESH_SECRET_present: Boolean(process.env.JWT_REFRESH_SECRET),
    ERP_API_KEY_present: Boolean(process.env.ERP_API_KEY || process.env.HK_ERP_API_KEY),
    ERP_WEBHOOK_SECRET_present: Boolean(process.env.ERP_WEBHOOK_SECRET),
    NODE_ENV: process.env.NODE_ENV,
  });

  const errors: string[] = [];

  const NODE_ENV =
    (process.env.NODE_ENV as 'development' | 'production' | 'test') ||
    'development';
  const rawPort = process.env.PORT || '3000';
  const PORT = parseInt(rawPort, 10);

  if (isNaN(PORT) || PORT <= 0 || PORT > 65535) {
    errors.push(
      `PORT deve ser um número de porta válido entre 1 e 65535 (recebido: "${rawPort}")`,
    );
  }

  // Leitura direta e limpeza de possíveis aspas envoltórias
  let DATABASE_URL = process.env.DATABASE_URL?.trim();
  if (DATABASE_URL && DATABASE_URL.startsWith('"') && DATABASE_URL.endsWith('"')) {
    DATABASE_URL = DATABASE_URL.slice(1, -1).trim();
  }
  if (DATABASE_URL && DATABASE_URL.startsWith("'") && DATABASE_URL.endsWith("'")) {
    DATABASE_URL = DATABASE_URL.slice(1, -1).trim();
  }

  if (!DATABASE_URL) {
    errors.push(
      'DATABASE_URL é obrigatória e não foi encontrada em process.env. Configure a connection string do PostgreSQL no painel do Coolify/Railway.',
    );
  } else if (
    !DATABASE_URL.startsWith('postgresql://') &&
    !DATABASE_URL.startsWith('postgres://')
  ) {
    errors.push(
      'DATABASE_URL deve ser uma connection string PostgreSQL válida (iniciando com postgresql:// ou postgres://)',
    );
  }

  // Validação direta do JWT_ACCESS_SECRET
  let rawAccessSecret = process.env.JWT_ACCESS_SECRET?.trim();
  if (rawAccessSecret && rawAccessSecret.startsWith('"') && rawAccessSecret.endsWith('"')) {
    rawAccessSecret = rawAccessSecret.slice(1, -1).trim();
  }
  const JWT_ACCESS_SECRET =
    rawAccessSecret ||
    (NODE_ENV === 'production'
      ? ''
      : 'hk_jwt_access_secret_super_key_2026_prod');

  if (!JWT_ACCESS_SECRET) {
    errors.push(
      'JWT_ACCESS_SECRET é obrigatória em ambiente de produção. Cadastre esta variável no painel do Coolify/Railway.',
    );
  } else if (JWT_ACCESS_SECRET.length < 16) {
    errors.push(
      'JWT_ACCESS_SECRET deve conter no mínimo 16 caracteres para garantir entropia criptográfica.',
    );
  }

  // Validação direta do JWT_REFRESH_SECRET
  let rawRefreshSecret = process.env.JWT_REFRESH_SECRET?.trim();
  if (rawRefreshSecret && rawRefreshSecret.startsWith('"') && rawRefreshSecret.endsWith('"')) {
    rawRefreshSecret = rawRefreshSecret.slice(1, -1).trim();
  }
  const JWT_REFRESH_SECRET =
    rawRefreshSecret ||
    (NODE_ENV === 'production'
      ? ''
      : 'hk_jwt_refresh_secret_super_key_2026_prod');

  if (!JWT_REFRESH_SECRET) {
    errors.push(
      'JWT_REFRESH_SECRET é obrigatória em ambiente de produção. Cadastre esta variável no painel do Coolify/Railway.',
    );
  } else if (JWT_REFRESH_SECRET.length < 16) {
    errors.push(
      'JWT_REFRESH_SECRET deve conter no mínimo 16 caracteres para garantir entropia criptográfica.',
    );
  }

  if (errors.length > 0) {
    logger.error(
      '❌ Falha crítica de inicialização: Configuração de variáveis de ambiente ausente ou inválida:',
    );
    errors.forEach((err) => logger.error(`  👉 ${err}`));
    throw new Error(
      `Falha de inicialização: ${errors.length} erro(s) de configuração de ambiente. Verifique as variáveis no painel da hospedagem.`,
    );
  }

  logger.log(
    ` Configurações de ambiente validadas com sucesso (NODE_ENV: ${NODE_ENV}, PORT: ${PORT})`,
  );

  const erpApiKey = process.env.ERP_API_KEY?.trim() || process.env.HK_ERP_API_KEY?.trim();
  const erpWebhookSecret = process.env.ERP_WEBHOOK_SECRET?.trim();

  return {
    NODE_ENV,
    PORT,
    DATABASE_URL: DATABASE_URL!,
    JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN?.trim() || '15m',
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN?.trim() || '30d',
    CORS_ORIGIN: process.env.CORS_ORIGIN?.trim(),
    ENABLE_SWAGGER: process.env.ENABLE_SWAGGER === 'true',
    ERP_API_KEY: erpApiKey,
    ERP_WEBHOOK_SECRET: erpWebhookSecret,
    HK_ERP_API_KEY: erpApiKey,
    HK_ERP_API_URL: process.env.HK_ERP_API_URL?.trim(),
  };
}
