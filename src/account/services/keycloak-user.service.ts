import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import url from 'url';
import { applicationConfig } from 'src/config';
import { AdminAccessTokenResponse, UserGroups } from 'src/interfaces';
import { AffiliateRegisterDto } from '../dtos';
import { generateUniqueUsername } from 'src/utils';
// import { generateUniqueUsername } from 'src/utils';

@Injectable()
export class KeycloakUserService {
  private readonly keycloakServer: string;
  private readonly keycloakRealm: string;

  constructor(private readonly httpService: HttpService) {
    this.keycloakServer = applicationConfig().keycloakServer;
    this.keycloakRealm = applicationConfig().keycloakServerRealmName;
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

      Logger.log('Retrieved admin access token');
      return response.data.access_token;
    } catch (err) {
      Logger.error(err?.response?.data?.error_description || err?.message);
      throw new InternalServerErrorException(
        err?.response?.data?.error_description ||
          err?.message ||
          'Error occured while retrieving keycloak admin token',
      );
    }
  }

  async createKeycloakUser(
    dto: AffiliateRegisterDto,
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
              username: generateUniqueUsername({
                firstName: dto.firstName,
                lastName: dto.lastName,
              }),
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
      Logger.error(
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
}
