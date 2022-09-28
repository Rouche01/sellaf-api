import { Controller, Post } from '@nestjs/common';

@Controller('account')
export class AccountController {
  @Post('register')
  register() {
    return 'Register user';
  }
}
