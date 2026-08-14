import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object = 'Erro interno no servidor';
    let errorCode = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || JSON.stringify(res);
        errorCode = (res as any).error || 'BAD_REQUEST';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const requestId = (request.headers['x-request-id'] as string) || uuidv4();

    response.status(status).json({
      statusCode: status,
      code: errorCode,
      message: message,
      requestId: requestId,
      timestamp: new Date().toISOString(),
    });
  }
}
