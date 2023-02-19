import { Module } from '@nestjs/common';
import { AccountModule } from 'src/account';
import { UserService } from './services';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [AccountModule],
})
export class UserModule {}
