/**
 * CONTRATO DEL MICROSERVICIO DE NOTIFICACIONES
 * ---------------------------------------------
 * Este archivo es la "fuente de verdad" que deben compartir (copiar, o
 * publicar como paquete npm interno más adelante) los demás
 * microservicios que interactúan con Notificaciones:
 *
 *  - Torneos, Inscripciones, Equipos, Fixture  → publican eventos por
 *    RabbitMQ para que Notificaciones cree y envíe un aviso.
 *  - ms-gateway → le pide cosas por TCP (historial, marcar leída,
 *    eliminar, preferencias) para exponerlas como REST al frontend.
 *
 * Notificaciones NUNCA valida JWT ni sabe de autenticación: eso ya se
 * resolvió antes de que el mensaje llegue acá (en auth / gateway).
 */

// ──────────────────────────────────────────────
// Tipos compartidos
// ──────────────────────────────────────────────

/** Tipos de notificación soportados (deben coincidir con schema.prisma) */
export enum NotificationType {
  /** NOT-2: Invitación a torneo */
  TOURNAMENT_INVITATION = 'TOURNAMENT_INVITATION',
  /** NOT-3: Cambios en torneo (horario, fixture, etc.) */
  TOURNAMENT_UPDATE = 'TOURNAMENT_UPDATE',
  /** NOT-4: Confirmación de inscripción */
  REGISTRATION_CONFIRMATION = 'REGISTRATION_CONFIRMATION',
  /** NOT-5: Resultados del torneo */
  TOURNAMENT_RESULT = 'TOURNAMENT_RESULT',
  /** Notificación genérica / de sistema */
  GENERIC = 'GENERIC',
}

/** Microservicio que origina la notificación (para trazabilidad) */
export type SourceService =
  | 'auth'
  | 'torneos'
  | 'inscripciones'
  | 'equipos'
  | 'fixture'
  | 'notificaciones';

/** Payload para crear una notificación (usado tanto por el evento simple como el bulk) */
export interface NotificationContractPayload {
  type: NotificationType;
  userId: string;
  title: string;
  message: string;
  tournamentId?: string;
  data?: Record<string, unknown>;
  sourceService: SourceService;
}

/** Igual que el anterior, pero para varios usuarios a la vez (ej. todo un equipo) */
export interface BulkNotificationContractPayload
  extends Omit<NotificationContractPayload, 'userId'> {
  userIds: string[];
}

/** Respuesta estándar ante una petición TCP de creación/consulta */
export interface NotificationAck {
  success: boolean;
  ids?: string[];
  error?: string;
}

// ──────────────────────────────────────────────
// RabbitMQ — eventos ENTRANTES (Torneos/Inscripciones/Equipos/Fixture → Notificaciones)
// Se consumen con @EventPattern (fire-and-forget, sin respuesta esperada).
// ──────────────────────────────────────────────

/** Nombre de la cola de RabbitMQ que escucha este microservicio */
export const NOTIFICATIONS_RABBITMQ_QUEUE = 'notifications_queue';

export const NOTIFICATION_EVENTS = {
  /** Crear y despachar una notificación a un único usuario */
  CREATE: 'notification.create',
  /** Crear y despachar la misma notificación a varios usuarios */
  CREATE_BULK: 'notification.create_bulk',
} as const;

// ──────────────────────────────────────────────
// TCP — mensajes SALIENTE→ENTRANTE (ms-gateway → Notificaciones)
// Se consumen con @MessagePattern (request/response, ms-gateway espera respuesta).
// ──────────────────────────────────────────────

export const NOTIFICATION_TCP_PATTERNS = {
  /** NOT-6: historial paginado/filtrable */
  FIND_ALL: 'notification.find_all',
  /** NOT-11: contador de no leídas */
  UNREAD_COUNT: 'notification.unread_count',
  /** NOT-7: marcar una como leída */
  MARK_AS_READ: 'notification.mark_as_read',
  /** NOT-8: marcar todas como leídas */
  MARK_ALL_AS_READ: 'notification.mark_all_as_read',
  /** NOT-9: eliminar una notificación */
  REMOVE: 'notification.remove',
  /** NOT-10: obtener preferencias de un usuario */
  GET_PREFERENCES: 'notification.get_preferences',
  /** NOT-10: actualizar preferencias de un usuario */
  UPDATE_PREFERENCES: 'notification.update_preferences',
} as const;

// ──────────────────────────────────────────────
// WebSocket — evento SALIENTE (Notificaciones → Frontend)
// ──────────────────────────────────────────────

export const NOTIFICATION_WS_EVENT = 'notification:new';