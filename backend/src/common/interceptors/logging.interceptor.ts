import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';

    // Reutilizar X-Request-Id se já vier de proxy/gateway ou gerar novo
    const requestId =
      (request.headers['x-request-id'] as string) || uuidv4();
    request.headers['x-request-id'] = requestId;
    response.setHeader('X-Request-Id', requestId);

    const userId = request.user?.id || 'ANONYMOUS';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = response.statusCode;
          const delay = Date.now() - now;

          this.logger.log(
            JSON.stringify({
              timestamp: new Date().toISOString(),
              requestId,
              method,
              url,
              statusCode,
              responseTimeMs: delay,
              userId,
              ip,
              userAgent,
            }),
          );
        },
      }),
    );
  }
}

