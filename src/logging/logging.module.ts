import { Module, Global } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { LoggingExceptionFilter } from './logging.exception-filter';
import { LoggingInterceptor } from './logging.interceptor';

@Global()
@Module({
  providers: [LoggingService, LoggingExceptionFilter, LoggingInterceptor],
  exports: [LoggingService, LoggingExceptionFilter, LoggingInterceptor],
})
export class LoggingModule {}
