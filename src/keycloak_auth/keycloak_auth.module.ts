import { Module } from '@nestjs/common';
import { KeycloakAuthService } from './services';

@Module({
  providers: [KeycloakAuthService],
  exports: [KeycloakAuthService],
})
export class KeycloakAuthModule {}
