import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applicationConfig } from './config';
import { badRequestExceptionFilter } from './filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: badRequestExceptionFilter,
    }),
  );
  const port = applicationConfig().port;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: ${port}`);
}
bootstrap();
