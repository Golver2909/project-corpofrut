import * as dotenv from 'dotenv';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NOTIFICATIONS_TCP_PORT: number;
  DATABASE_URL: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    NOTIFICATIONS_TCP_PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  notificationsTcpPort: envVars.NOTIFICATIONS_TCP_PORT,
  databaseUrl: envVars.DATABASE_URL,
};