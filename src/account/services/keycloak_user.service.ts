import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import url from 'url';
import { applicationConfig } from 'src/config';
import {
  CreateKeycloakUser,
  KeycloakUserLoginResponse,
  UpdateKeycloakUserPayload,
} from '../interfaces';
import { AdminAccessTokenResponse } from '../interfaces';
import { AppLoggerService } from 'src/app_logger';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class KeycloakUserService {
  private readonly logger = new AppLoggerService(KeycloakUserService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(applicationConfig.KEY)
    private readonly appConfig: ConfigType<typeof applicationConfig>,
  ) {}

  private async getKeycloakAdminAccessToken(): Promise<string> {
    const clientId = applicationConfig().keycloakAdminClientId;
    const clientSecret = applicationConfig().keycloakAdminClientSecret;

    const tokenUrl = `${this.appConfig.keycloakServer}/realms/master/protocol/openid-connect/token`;
    const params = new url.URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    });

    try {
      const response = await lastValueFrom(
        this.httpService
          .post<AdminAccessTokenResponse>(tokenUrl, params.toString())
          .pipe(),
      );

      this.logger.log('Retrieved admin access token');
      return response.data.access_token;
    } catch (err) {
      this.logger.error(err?.response?.data?.error_description || err?.message);
      throw new InternalServerErrorException(
        err?.response?.data?.error_description ||
          err?.message ||
          'Error occured while retrieving keycloak admin token',
      );
    }
  }

  async createKeycloakUser({
    userData,
    username,
    userGroup,
    emailVerified = false,
    userAttrs,
  }: CreateKeycloakUser): Promise<string> {
    const createUserUrl = `${this.appConfig.keycloakServer}/admin/realms/${this.appConfig.keycloakServerRealmName}/users`;

    const adminAccessToken = await this.getKeycloakAdminAccessToken();
    try {
      const response = await lastValueFrom(
        this.httpService
          .post(
            createUserUrl,
            {
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              enabled: true,
              emailVerified,
              username,
              credentials: [
                {
                  type: 'password',
                  value: userData.password,
                  temporary: false,
                },
              ],
              groups: userGroup,
              ...(userAttrs && { attributes: userAttrs }),
            },
            {
              headers: { Authorization: `Bearer ${adminAccessToken}` },
            },
          )
          .pipe(),
      );

      const locationHeaderVal = response.headers['location'];
      const locationSplits = locationHeaderVal.split('/');
      const kcUserId = locationSplits[locationSplits.length - 1];

      return kcUserId;
    } catch (err) {
      this.logger.error(
        err?.response?.data?.error ||
          err?.response?.data?.errorMessage ||
          err.message,
      );

      if (err?.response?.data?.error || err?.response?.data?.errorMessage) {
        throw new BadRequestException(
          err?.response?.data?.error || err?.response?.data?.errorMessage,
        );
      }
      throw new InternalServerErrorException(err.message);
    }
  }

  async loginKeycloakUser(username: string, password: string) {
    const loginUrl = `${this.appConfig.keycloakServer}/realms/Sellaf/protocol/openid-connect/token`;
    const params = new url.URLSearchParams({
      username,
      password,
      client_secret: this.appConfig.kcSellafApiClientSecret,
      client_id: this.appConfig.kcSellafApiClientId,
      grant_type: 'password',
    });

    try {
      const response = await lastValueFrom(
        this.httpService
          .post<KeycloakUserLoginResponse>(loginUrl, params.toString())
          .pipe(),
      );

      this.logger.log(`${username} logged into keycloak auth server`);
      return response.data;
    } catch (err) {
      this.logger.error(err?.response?.data || err?.message);
      if (err?.response?.data?.error_description) {
        throw new BadRequestException(err.response.data.error_description);
      }
      throw new InternalServerErrorException(err?.message);
    }
  }

  async updateKeycloakUser(
    userId: string,
    updatePayload: UpdateKeycloakUserPayload,
  ) {
    const updateUserUrl = `${this.appConfig.keycloakServer}/admin/realms/${this.appConfig.keycloakServerRealmName}/users/${userId}`;
    const adminAccessToken = await this.getKeycloakAdminAccessToken();

    try {
      await lastValueFrom(
        this.httpService
          .put(updateUserUrl, updatePayload, {
            headers: { Authorization: `Bearer ${adminAccessToken}` },
          })
          .pipe(),
      );

      this.logger.log(`Updated user ${userId}`);
    } catch (err) {
      this.logger.log(err?.response?.data || err?.message);
      throw new InternalServerErrorException(
        err?.message || 'Unable to update keycloak user',
      );
    }
  }
}
