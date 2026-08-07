/**
 * CONTRATO DEL MICROSERVICIO DE LOGS
 * ------------------------------------
 * Los campos acá DEBEN coincidir con lo que espera el modelo Log
 * de ms-logs (ver su schema.prisma) — es lo que su LogsController
 * recibe en el @Payload() y pasa directo a Prisma para guardar.
 */

/** Debe coincidir EXACTO con el enum LogType de schema.prisma en ms-logs */
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

/** Nombre de la cola de RabbitMQ que escucha ms-logs */
export const LOGS_RABBITMQ_QUEUE = 'logs_queue';

/** Patrón de evento para crear un log */
export const LOG_EVENTS = {
  CREATE: 'log.create',
} as const;

/** Payload que se manda al emitir un log — mapea 1 a 1 con el modelo Log de ms-logs */
export interface LogContractPayload {
  type: LogType;
  description: string;
  service: LogSourceService;
  userId?: string;
  clienteIp?: string;
  endpoint?: string;
  metadata?: Record<string, unknown>;
}