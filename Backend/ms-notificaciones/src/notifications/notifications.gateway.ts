import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
 * Este es el ÚNICO punto de ms-notificaciones al que el frontend le pega
 * directo, sin pasar por ms-gateway. Por eso la validación de identidad
 * tiene que hacerse acá mismo, con el JWT (no con Redis todavía, eso se
 * suma después como una capa extra sin tocar esta lógica).
 *
 * El cliente se conecta mandando el JWT:
 *   io('http://localhost:3007/notifications', { auth: { token: '<jwt>' } })
 *
 * El userId sale de decodificar y verificar ese token acá, nunca de un
 * query param que declare el cliente.
 */
@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN ?? '*' },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const userId = await this.authenticate(client);
    if (!userId) {
      this.logger.warn(`Conexión rechazada: token inválido o ausente (socket ${client.id})`);
      client.disconnect(true);
      return;
    }
    client.data.userId = userId;
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

  /**
   * Verifica el JWT del handshake y devuelve el userId (claim `sub`).
   *
   * TODO cuando ms-auth + Redis estén listos: agregar acá, después de
   * verifyAsync, un chequeo de sesión activa:
   *   const activa = await redisService.get(`session:${payload.sub}`);
   *   if (!activa) return undefined;
   * No hace falta tocar nada más de este archivo para sumarlo.
   */
  private async authenticate(client: Socket): Promise<string | undefined> {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.query?.token as string | undefined);
    if (!token) return undefined;

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      return payload.sub;
    } catch {
      return undefined;
    }
  }
}