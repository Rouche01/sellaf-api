import Joi from 'joi';

export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  PORT: Joi.number().port().default(8080),
  APP_ENVIRONMENT: Joi.string()
    .valid('development', 'production')
    .default('production'),
});
