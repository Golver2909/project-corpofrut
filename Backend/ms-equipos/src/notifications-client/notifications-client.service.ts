import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

/**
 * Cliente hacia el microservicio de Notificaciones. Copia el patrón
 * usado en Notificaciones para hablarle a Logs (logs-client), aplicado
 * acá en sentido inverso.
 */
@Injectable()
export class NotificationsClientService {
  private readonly logger = new Logger(NotificationsClientService.name);

  constructor(@Inject('NOTIFICATIONS_SERVICE') private readonly client: ClientProxy) {}

  /** NOT-2: avisarle a un usuario que fue invitado a un equipo */
  notifyInvitation(userId: string, teamId: string) {
    this.send('notification.create', {
      type: 'TOURNAMENT_INVITATION',
      userId,
      data: { teamId },
      title: 'Invitación a equipo',
      message: 'Fuiste invitado a formar parte de un equipo.',
      sourceService: 'equipos',
    });
  }

  private send(pattern: string, payload: Record<string, unknown>) {
    try {
      this.client.emit(pattern, payload);
    } catch (err) {
      this.logger.warn(`No se pudo enviar la notificación: ${(err as Error).message}`);
    }
  }
}