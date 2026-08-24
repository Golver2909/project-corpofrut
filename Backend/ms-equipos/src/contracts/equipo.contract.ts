/**
 * CONTRATO DEL MICROSERVICIO DE EQUIPOS
 * ----------------------------------------
 * Fuente de verdad para quienes necesiten hablarle a Equipos:
 *
 *  - Torneos/Inscripciones → le piden por TCP validar/consultar equipos
 *    (ej. cantidad de integrantes, si está bloqueado/deshabilitado).
 *  - ms-gateway → le pide por TCP todo lo que necesita el frontend
 *    (crear equipo, invitar, aceptar/rechazar, listar, etc.)
 *
 * Equipos NUNCA valida JWT — confía en que el mensaje que le llega ya
 * pasó por auth/gateway (apura mati con lo de redis).
 */

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

/** Nombre de la cola de RabbitMQ que escucha este microservicio (eventos entrantes) */
export const EQUIPOS_RABBITMQ_QUEUE = 'equipos_queue';

/** Eventos que Equipos escucha por RabbitMQ (ej. Torneos avisando cierre de inscripción) */
export const EQUIPO_EVENTS = {
  /** Torneos/Inscripciones avisa que se cerró el período de modificaciones (EQ-5) */
  LOCK_TEAM: 'equipo.lock',
} as const;

/** Patrones TCP que Equipos responde (para ms-gateway, Torneos, Inscripciones) */
export const EQUIPO_TCP_PATTERNS = {
  CREATE: 'equipo.create',                     // EQ-1
  INVITE_MEMBER: 'equipo.invite_member',        // EQ-2
  RESPOND_INVITATION: 'equipo.respond_invitation', // EQ-3
  GET_ROSTER: 'equipo.get_roster',              // EQ-4
  REMOVE_MEMBER: 'equipo.remove_member',        // EQ-7
  DISABLE: 'equipo.disable',                    // EQ-9
  FIND_ALL: 'equipo.find_all',                  // EQ-10 (admin, sin filtro)
  FIND_BY_IDS: 'equipo.find_by_ids',            // EQ-8 (gateway le pasa los IDs que le dio Inscripciones)
  GET_DETAIL: 'equipo.get_detail',              // EQ-11
} as const;

/** Payload para equipo.lock (evento entrante) */
export interface LockTeamEventPayload {
  teamId: string;
}

/** Payload para crear un equipo (EQ-1) */
export interface CreateEquipoPayload {
  name: string;
  captainUserId: string;
}

/** Payload para invitar a un integrante (EQ-2) */
export interface InviteMemberPayload {
  teamId: string;
  requesterUserId: string; // quién invita (se valida que sea el capitán)
  invitedUserId: string;
}

/** Payload para aceptar/rechazar invitación (EQ-3) */
export interface RespondInvitationPayload {
  teamId: string;
  userId: string;
  accept: boolean;
}

/** Payload para eliminar un integrante (EQ-7) */
export interface RemoveMemberPayload {
  teamId: string;
  requesterUserId: string;
  memberUserId: string;
}

/** Payload para deshabilitar un equipo (EQ-9) */
export interface DisableEquipoPayload {
  teamId: string;
  requesterUserId: string; // el organizador que deshabilita
  reason?: string;
}

/** Respuesta estándar de un equipo, para listados y detalle */
export interface EquipoResponse {
  id: string;
  name: string;
  isBlocked: boolean;
  isDisabled: boolean;
  members: {
    userId: string;
    isCaptain: boolean;
    status: InvitationStatus;
  }[];
}