import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import url from 'url';
import { applicationConfig } from 'src/config';
import { KeycloakUserLoginResponse, UserGroups } from '../interfaces';
import { AdminAccessTokenResponse } from '../interfaces';
import { AffiliateRegisterDto } from '../dtos';
import { AppLoggerService } from 'src/app_logger';

@Injectable()
export class KeycloakUserService {
  private readonly keycloakServer: string;
  private readonly keycloakRealm: string;
  private readonly kcSellafApiClientId: string;
  private readonly kcSellafApiClientSecret: string;
  private readonly logger = new AppLoggerService(KeycloakUserService.name);

  constructor(private readonly httpService: HttpService) {
    this.keycloakServer = applicationConfig().keycloakServer;
    this.keycloakRealm = applicationConfig().keycloakServerRealmName;
    this.kcSellafApiClientId = applicationConfig().kcSellafApiClientId;
    this.kcSellafApiClientSecret = applicationConfig().kcSellafApiClientSecret;
  }

  private async getKeycloakAdminAccessToken(): Promise<string> {
    const clientId = applicationConfig().keycloakAdminClientId;
    const clientSecret = applicationConfig().keycloakAdminClientSecret;

    const tokenUrl = `${this.keycloakServer}/realms/master/protocol/openid-connect/token`;
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

  async createKeycloakUser(
    dto: AffiliateRegisterDto,
    username: string,
    userGroup: Array<UserGroups>,
    userAttrs: { [key: string]: any },
  ): Promise<void> {
    const createUserUrl = `${this.keycloakServer}/admin/realms/${this.keycloakRealm}/users`;

    const adminAccessToken = await this.getKeycloakAdminAccessToken();
    try {
      await lastValueFrom(
        this.httpService
          .post(
            createUserUrl,
            {
              email: dto.email,
              firstName: dto.firstName,
              lastName: dto.lastName,
              enabled: true,
              username,
              credentials: [
                {
                  type: 'password',
                  value: dto.password,
                  temporary: false,
                },
              ],
              groups: userGroup,
              attributes: userAttrs,
            },
            {
              headers: { Authorization: `Bearer ${adminAccessToken}` },
            },
          )
          .pipe(),
      );
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
    const loginUrl = `${this.keycloakServer}/realms/Sellaf/protocol/openid-connect/token`;
    const params = new url.URLSearchParams({
      username,
      password,
      client_secret: this.kcSellafApiClientSecret,
      client_id: this.kcSellafApiClientId,
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
      this.logger.error(err?.message);
      throw new InternalServerErrorException(
        err?.message || 'Unable to log user in auth server',
      );
    }
  }

  async updateKeycloakUser(userId: string) {
    const updateUserUrl = `${this.keycloakServer}/admin/realms/${this.keycloakRealm}/users/${userId}`;
  }
}
