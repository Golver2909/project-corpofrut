import * as dotenv from 'dotenv';
import * as joi from 'joi';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvVars {
  PORT: number;
  EQUIPOS_TCP_PORT: number;
  DATABASE_URL: string;
  RABBITMQ_URL: string;
  CORS_ORIGIN: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    EQUIPOS_TCP_PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    RABBITMQ_URL: joi.string().required(),
    CORS_ORIGIN: joi.string().default('*'),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  equiposTcpPort: envVars.EQUIPOS_TCP_PORT,
  databaseUrl: envVars.DATABASE_URL,
  rabbitmqUrl: envVars.RABBITMQ_URL,
  corsOrigin: envVars.CORS_ORIGIN,
};