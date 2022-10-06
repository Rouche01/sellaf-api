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
  SMTP_HOST: Joi.string().required(),
  SMTP_USERNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().default(6379),
  BCRYPT_TOKEN_SALT: Joi.number().required(),
  KC_SELLAF_API_CLIENT_ID: Joi.string().required(),
  KC_SELLAF_API_CLIENT_SECRET: Joi.string().required(),
});
