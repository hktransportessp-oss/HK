import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { validateEnvironment } from './common/config/env.validation';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // 1. Validação estrita de variáveis de ambiente antes da inicialização
    const config = validateEnvironment();

    // 2. Instanciação da aplicação NestJS
    const app = await NestFactory.create(AppModule, {
      logger:
        config.NODE_ENV === 'production'
          ? ['error', 'warn', 'log']
          : ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // 3. Ativação de Graceful Shutdown Hooks (SIGTERM, SIGINT)
    app.enableShutdownHooks();

    // 4. Headers de segurança HTTP (Helmet)
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      }),
    );

    // 5. Configuração de CORS segura por ambiente
    const corsOrigin = config.CORS_ORIGIN
      ? config.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : true;

    app.enableCors({
      origin: corsOrigin,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Request-Id', 'X-Requested-With'],
      exposedHeaders: ['X-Request-Id'],
    });

    // 6. Validation Pipe Global com proteção contra mass-assignment
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // 7. Global Exception Filter com sanitização e mapeamento de Prisma
    app.useGlobalFilters(new HttpExceptionFilter());

    // 8. Global HTTP Logging Interceptor estruturado
    app.useGlobalInterceptors(new LoggingInterceptor());

    // 9. Documentação Swagger OpenAPI
    if (config.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
      const swaggerConfig = new DocumentBuilder()
        .setTitle('API Central Real HK Transportes')
        .setDescription(
          'Documentação dos Endpoints REST do ecossistema HK Connect, ERP e Painel Operacional',
        )
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, swaggerConfig);
      SwaggerModule.setup('api/docs', app, document);
      logger.log(`📚 Swagger OpenAPI Documentation: http://0.0.0.0:${config.PORT}/api/docs`);
    }

    // 10. Inicialização escutando em 0.0.0.0 para compatibilidade com containers Docker / Coolify
    await app.listen(config.PORT, '0.0.0.0');

    logger.log(`🚀 Backend HK Central running on: http://0.0.0.0:${config.PORT}`);
    logger.log(` Ambiente: ${config.NODE_ENV.toUpperCase()}`);
  } catch (error) {
    logger.error(
      `❌ Falha fatal durante o bootstrap da aplicação: ${(error as Error).message}`,
      (error as Error).stack,
    );
    process.exit(1);
  }
}

bootstrap();

