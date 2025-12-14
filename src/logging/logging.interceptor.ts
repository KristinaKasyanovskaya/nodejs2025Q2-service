import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, query, body } = request;
    const startTime = Date.now();
    const baseUrl = url.split('?')[0];
    const hasQuery = query && Object.keys(query).length > 0;

    const requestLog: any = {
      method,
      url: baseUrl,
    };

    if (hasQuery) {
      requestLog.query = query;
    }

    if (body && Object.keys(body).length > 0) {
      requestLog.body = this.sanitizeBody(body);
    }

    this.loggingService.log(
      `Incoming Request: ${JSON.stringify(requestLog, null, 2)}`,
      'LoggingInterceptor',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - startTime;
          const responseLog = {
            method,
            url: baseUrl,
            statusCode,
            duration: `${duration}ms`,
          };

          this.loggingService.log(
            `Outgoing Response: ${JSON.stringify(responseLog, null, 2)}`,
            'LoggingInterceptor',
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error?.status || 500;
          const errorResponseLog = {
            method,
            url: baseUrl,
            statusCode,
            duration: `${duration}ms`,
            error: error?.message || 'Unknown error',
          };

          this.loggingService.error(
            `Error Response: ${JSON.stringify(errorResponseLog, null, 2)}`,
            'LoggingInterceptor',
          );
        },
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (typeof body === 'object' && body !== null) {
      const sanitized = { ...body };
      if ('password' in sanitized) {
        sanitized.password = '***';
      }
      return sanitized;
    }
    return body;
  }
}
