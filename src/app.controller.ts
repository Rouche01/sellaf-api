import { Controller, Get } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';

@Controller()
export class AppController {
  @Get()
  @Public()
  getHello(): string {
    return 'Hello World!';
  }
}
