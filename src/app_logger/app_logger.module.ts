import { Module } from '@nestjs/common';
import { AppLoggerService } from './services';

@Module({
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class AppLoggerModule {}
