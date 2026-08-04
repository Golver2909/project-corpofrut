import * as dotenv from 'dotenv';
import * as joi from 'joi';

dotenv.config();

interface EnvVars {
    LOGS_MS_PORT: number;
    LOGS_MS_HOST: string;
    DATABASE_URL: string;
    RABBITMQ_URL: string;
}

const envsSchema = joi
    .object({
        LOGS_MS_PORT: joi.number().required(),
        LOGS_MS_HOST: joi.string().required(),
        DATABASE_URL: joi.string().required(),
        RABBITMQ_URL: joi.string().required()
    })
    .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) throw new Error(`Config validation error: ${error.message}`);

const envVars: EnvVars = value;

export const envs = {
    LOGS_MS_PORT: envVars.LOGS_MS_PORT,
    LOGS_MS_HOST: envVars.LOGS_MS_HOST,
    DATABASE_URL: envVars.DATABASE_URL,
    RABBITMQ_URL: envVars.RABBITMQ_URL
};