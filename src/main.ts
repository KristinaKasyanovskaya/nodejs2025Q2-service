import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingService } from './logging/logging.service';
import { LoggingExceptionFilter } from './logging/logging.exception-filter';
import { LoggingInterceptor } from './logging/logging.interceptor';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get LoggingService instance
  const loggingService = app.get(LoggingService);
  const loggingExceptionFilter = app.get(LoggingExceptionFilter);
  const loggingInterceptor = app.get(LoggingInterceptor);

  // Set up global exception filter
  app.useGlobalFilters(loggingExceptionFilter);

  // Set up global interceptor
  app.useGlobalInterceptors(loggingInterceptor);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: false,
    }),
  );

  // Set up uncaughtException listener
  process.on('uncaughtException', (error: Error) => {
    loggingService.error(
      `Uncaught Exception: ${error.message}\n${error.stack || ''}`,
      'UncaughtException',
    );
    process.exit(1);
  });

  // Set up unhandledRejection listener
  process.on('unhandledRejection', (reason: unknown) => {
    const errorMessage =
      reason instanceof Error
        ? `Unhandled Rejection: ${reason.message}\n${reason.stack || ''}`
        : `Unhandled Rejection: ${String(reason)}`;
    loggingService.error(errorMessage, 'UnhandledRejection');
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  loggingService.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
}
bootstrap();
