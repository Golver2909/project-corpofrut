import * as dotenv from 'dotenv';
import * as joi from 'joi';

dotenv.config();

interface EnvVars {
    INSCRIPCIONES_MS_PORT: number;
    INSCRIPCIONES_MS_HOST: string;
    DATABASE_URL: string;
}

const envsSchema = joi
    .object({
        INSCRIPCIONES_MS_PORT: joi.string().required(),
        INSCRIPCIONES_MS_HOST: joi.string().required(),
        DATABASE_URL: joi.string().required(),
    })
    .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) throw new Error(`Config validation error: ${error.message}`);

const envVars: EnvVars = value;

export const envs = {
    INSCRIPCIONES_MS_PORT: envVars.INSCRIPCIONES_MS_PORT,
    INSCRIPCIONES_MS_HOST: envVars.INSCRIPCIONES_MS_HOST,
    DATABASE_URL: envVars.DATABASE_URL
};