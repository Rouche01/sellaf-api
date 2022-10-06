import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  KeycloakConnectOptions,
  KeycloakConnectOptionsFactory,
  TokenValidation,
} from 'nest-keycloak-connect';
import { applicationConfig } from 'src/config';

@Injectable()
export class KeycloakAuthService implements KeycloakConnectOptionsFactory {
  constructor(
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {}

  createKeycloakConnectOptions():
    | KeycloakConnectOptions
    | Promise<KeycloakConnectOptions> {
    return {
      authServerUrl: this.appConfig.keycloakServer,
      // added secret because it is a required property but not needed for offline token validation
      secret: '',
      realm: this.appConfig.keycloakServerRealmName,
      tokenValidation: TokenValidation.OFFLINE,
    };
  }
}
