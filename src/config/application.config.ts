import { registerAs } from '@nestjs/config';

export const applicationConfig = registerAs('application', () => ({
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT,
  appEnvironment: process.env.APP_ENVIRONMENT,
  keycloakServer: process.env.KEYCLOAK_SERVER,
  keycloakServerRealmName: process.env.KEYCLOAK_SERVER_REALM_NAME,
  keycloakAdminClientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID,
  keycloakAdminClientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
  smtpHost: process.env.SMTP_HOST,
  smtpUsername: process.env.SMTP_USERNAME,
  smtpPassword: process.env.SMTP_PASSWORD,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  bcryptTokenSalt: process.env.BCRYPT_TOKEN_SALT,
}));
