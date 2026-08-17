import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Erro interno no servidor';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    const requestId =
      (request.headers['x-request-id'] as string) ||
      (response.getHeader('x-request-id') as string) ||
      uuidv4();

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        errorCode = exception.name || 'HTTP_EXCEPTION';
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || JSON.stringify(res);
        errorCode = (res as any).error || exception.name || 'BAD_REQUEST';
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Mapeamento seguro de erros conhecidos do Prisma sem vazar SQL
      switch (exception.code) {
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          errorCode = 'RESOURCE_ALREADY_EXISTS';
          const target = (exception.meta?.target as string[]) || [];
          message = `Conflito: registro duplicado para o(s) campo(s): ${target.join(', ') || 'recurso existente'}`;
          break;
        }
        case 'P2025': {
          status = HttpStatus.NOT_FOUND;
          errorCode = 'RESOURCE_NOT_FOUND';
          message = 'O registro solicitado não foi encontrado no banco de dados';
          break;
        }
        case 'P2003': {
          status = HttpStatus.BAD_REQUEST;
          errorCode = 'FOREIGN_KEY_VIOLATION';
          message = 'Operação inválida devido a restrição de integridade referencial';
          break;
        }
        default: {
          status = HttpStatus.BAD_REQUEST;
          errorCode = `PRISMA_${exception.code}`;
          message = 'Erro de integridade ou validação no banco de dados';
          break;
        }
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      errorCode = 'DATABASE_VALIDATION_ERROR';
      message = 'Dados inválidos fornecidos para operação de banco de dados';
    } else if (exception instanceof Error) {
      // Em produção, não expor detalhes de stack ou exceptions genéricas
      if (process.env.NODE_ENV === 'production') {
        message = 'Erro interno inesperado no servidor';
      } else {
        message = exception.message;
      }
      errorCode = exception.name || 'SERVER_ERROR';
    }

    // Log interno estruturado para observabilidade e depuração
    const logData = {
      requestId,
      method: request.method,
      url: request.url,
      statusCode: status,
      errorCode,
      errorMessage: typeof message === 'string' ? message : JSON.stringify(message),
      ip: request.ip,
      userAgent: request.get('user-agent') || '',
    };

    if (status >= 500) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - ${status} [${errorCode}]`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.url} - ${status} [${errorCode}] - ${JSON.stringify(message)}`,
      );
    }

    response.setHeader('X-Request-Id', requestId);
    response.status(status).json({
      statusCode: status,
      code: errorCode,
      message: message,
      requestId: requestId,
      timestamp: new Date().toISOString(),
    });
  }
}

