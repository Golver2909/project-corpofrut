import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NOTIFICATION_WS_EVENT } from '../contracts/notification.contract';

/**
 * Canal en tiempo real hacia el frontend (Web/Angular y Móvil/React Native).
 *
 * El cliente se conecta indicando su userId, ej:
 *   io('http://localhost:3007/notifications', { query: { userId: '123' } })
 *
 * y se suscribe a la room `user:123`. Cuando se crea una notificación
 * para ese usuario, este gateway emite el evento `notification:new`.
 */
@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN ?? '*' },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    if (!userId) {
      this.logger.warn(`Conexión rechazada sin userId (socket ${client.id})`);
      client.disconnect(true);
      return;
    }
    client.join(this.roomFor(userId));
    this.logger.log(`Usuario ${userId} conectado (socket ${client.id})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket desconectado (${client.id})`);
  }

  /** Emite una notificación nueva al usuario correspondiente, si está conectado */
  emitToUser(userId: string, notification: unknown) {
    this.server.to(this.roomFor(userId)).emit(NOTIFICATION_WS_EVENT, notification);
  }

  private roomFor(userId: string) {
    return `user:${userId}`;
  }

  private extractUserId(client: Socket): string | undefined {
    const fromQuery = client.handshake.query?.userId;
    return Array.isArray(fromQuery) ? fromQuery[0] : fromQuery;
  }
}