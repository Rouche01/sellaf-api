import Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  PORT: Joi.number().port().default(8080),
  APP_ENVIRONMENT: Joi.string()
    .valid('development', 'production')
    .default('production'),
  KEYCLOAK_SERVER: Joi.string().required(),
  KEYCLOAK_SERVER_REALM_NAME: Joi.string().required(),
  KEYCLOAK_ADMIN_CLIENT_ID: Joi.string().required(),
  KEYCLOAK_ADMIN_CLIENT_SECRET: Joi.string().required(),
});
