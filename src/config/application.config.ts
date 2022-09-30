import { registerAs } from '@nestjs/config';

export const applicationConfig = registerAs('application', () => ({
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT,
  appEnvironment: process.env.APP_ENVIRONMENT,
  keycloakServer: process.env.KEYCLOAK_SERVER,
  keycloakServerRealmName: process.env.KEYCLOAK_SERVER_REALM_NAME,
  keycloakAdminClientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID,
  keycloakAdminClientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
}));
