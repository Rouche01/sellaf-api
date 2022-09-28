import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applicationConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const port = applicationConfig().port;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: ${port}`);
}
bootstrap();
