import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { AppLoggerService } from './app_logger';
import { applicationConfig } from './config';
import { badRequestExceptionFilter } from './filters';
import { PlatformSetupService } from './platform_setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.get(PlatformSetupService).createPlatformManager();
  app.setGlobalPrefix('api', { exclude: ['/admin/queues'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: badRequestExceptionFilter,
    }),
  );
  app.useLogger(app.get(AppLoggerService));
  const port = applicationConfig().port;
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3000', 'https://app.sellaf.africa'],
    credentials: true,
  });
  await app.listen(port);
  Logger.log(`🚀 Application is running on: ${port}`);
}
bootstrap();
