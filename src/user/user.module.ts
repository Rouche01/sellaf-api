import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account';
import { QueueManagerModule } from 'src/queue_manager';
import { UserService } from './services';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [AccountModule, QueueManagerModule],
})
export class UserModule {}
