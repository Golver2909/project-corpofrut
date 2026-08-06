/*
    * CONTRATO DEL MICROSERVICIO DE LOGS
    * ------------------------------------
    * Los campos acá DEBEN coincidir con lo que espera el modelo Log
    * de ms-logs (ver su schema.prisma) — es lo que su LogsEventsController
    * recibe en el @Payload() y pasa directo a Prisma para guardar.
    */

/* Debe coincidir EXACTO con el enum LogType de schema.prisma en ms-logs */
export enum LogType {
    Error = 'Error',
    Warning = 'Warning',
    Info = 'Info',
}

export type LogSourceService =
    | 'auth'
    | 'torneos'
    | 'inscripciones'
    | 'equipos'
    | 'fixture'
    | 'notificaciones'
    | 'logs';

export const LOGS_RABBITMQ_QUEUE = 'logs_queue';

export const LOG_EVENTS = {
    CREATE: 'log.create',
} as const;

/** Payload que se manda al emitir un log — mapea 1 a 1 con el modelo Log */
export interface LogContractPayload {
    type: LogType;
    description: string;
    service: LogSourceService;
    userId?: string;
    clienteIp?: string;
    endpoint?: string;
    metadata?: Record<string, unknown>;
    // timestamp NO va acá: el modelo lo genera solo con @default(now())
}