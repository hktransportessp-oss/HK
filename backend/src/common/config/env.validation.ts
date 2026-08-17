import { Logger } from '@nestjs/common';

export interface AppConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGIN?: string;
  ERP_API_KEY?: string;
  HK_ERP_API_URL?: string;
}

export function validateEnvironment(): AppConfig {
  const logger = new Logger('EnvValidation');
  const errors: string[] = [];

  const NODE_ENV = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
  const rawPort = process.env.PORT || '3000';
  const PORT = parseInt(rawPort, 10);

  if (isNaN(PORT) || PORT <= 0 || PORT > 65535) {
    errors.push(`PORT deve ser um número de porta válido entre 1 e 65535 (recebido: "${rawPort}")`);
  }

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    errors.push('DATABASE_URL é obrigatória e não foi configurada nas variáveis de ambiente');
  } else if (!DATABASE_URL.startsWith('postgresql://') && !DATABASE_URL.startsWith('postgres://')) {
    errors.push('DATABASE_URL deve ser uma connection string PostgreSQL válida (iniciando com postgresql:// ou postgres://)');
  }

  // Em produção, exigimos secrets explícitos e com tamanho mínimo de segurança
  const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || (NODE_ENV === 'production' ? '' : 'hk_jwt_access_secret_super_key_2026_prod');
  if (!JWT_ACCESS_SECRET) {
    errors.push('JWT_ACCESS_SECRET é obrigatória em ambiente de produção');
  } else if (JWT_ACCESS_SECRET.length < 16) {
    errors.push('JWT_ACCESS_SECRET deve conter no mínimo 16 caracteres para garantir entropia criptográfica');
  }

  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (NODE_ENV === 'production' ? '' : 'hk_jwt_refresh_secret_super_key_2026_prod');
  if (!JWT_REFRESH_SECRET) {
    errors.push('JWT_REFRESH_SECRET é obrigatória em ambiente de produção');
  } else if (JWT_REFRESH_SECRET.length < 16) {
    errors.push('JWT_REFRESH_SECRET deve conter no mínimo 16 caracteres para garantir entropia criptográfica');
  }

  if (errors.length > 0) {
    logger.error('❌ Falha crítica de inicialização: Configuração de variáveis de ambiente inválida:');
    errors.forEach((err) => logger.error(`  - ${err}`));
    throw new Error(`Falha de inicialização: ${errors.length} erro(s) de configuração de ambiente.`);
  }

  logger.log(` Configurações de ambiente validadas com sucesso (NODE_ENV: ${NODE_ENV}, PORT: ${PORT})`);

  return {
    NODE_ENV,
    PORT,
    DATABASE_URL: DATABASE_URL!,
    JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    ERP_API_KEY: process.env.ERP_API_KEY,
    HK_ERP_API_URL: process.env.HK_ERP_API_URL,
  };
}
