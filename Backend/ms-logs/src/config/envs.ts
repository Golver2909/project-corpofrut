import * as dotenv from 'dotenv';
import * as joi from 'joi';

dotenv.config();

interface EnvVars {
    PORT: number;
    LOGS_MS_PORT: number;
    LOGS_MS_HOST: string;
    DATABASE_LOGS: string;
}

const envsSchema = joi
    .object({
        PORT: joi.number().required(),
        LOGS_MS_PORT: joi.number().required(),
        LOGS_MS_HOST: joi.number().required(),
        DATABASE_LOGS: joi.number().required()
    })
    .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) throw new Error(`Config validation error: ${error.message}`);

const envVars: EnvVars = value;

export const envs = {
    PORT: envVars.PORT,
    LOGS_MS_PORT: envVars.LOGS_MS_PORT,
    LOGS_MS_HOST: envVars.LOGS_MS_HOST,
    DATABASE_LOGS: envVars.DATABASE_LOGS
};