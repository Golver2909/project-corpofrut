import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateBulkNotificationDto } from './dto/create-bulk-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  /** Llega por RabbitMQ: crear y despachar una notificación a un usuario */
  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({ data: dto });
    await this.dispatchRealtime(notification);
    return notification;
  }

  /** Llega por RabbitMQ: crear la misma notificación para varios usuarios */
  async createBulk(dto: CreateBulkNotificationDto) {
    const { userIds, ...rest } = dto;

    const created = await this.prisma.$transaction(
      userIds.map((userId) =>
        this.prisma.notification.create({ data: { ...rest, userId } }),
      ),
    );

    await Promise.all(created.map((n) => this.dispatchRealtime(n)));
    return created;
  }

  /** Llega por TCP (ms-gateway): NOT-6, historial paginado/filtrable */
  async findForUser(query: QueryNotificationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      userId: query.userId,
      ...(query.read !== undefined ? { read: query.read } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Llega por TCP: NOT-11, contador de no leídas */
  unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }

  /** Llega por TCP: NOT-7, marcar una como leída */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notificación no encontrada');

    return this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
  }

  /** Llega por TCP: NOT-8, marcar todas como leídas */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    return { updated: result.count };
  }

  /** Llega por TCP: NOT-9, eliminar una notificación */
  async remove(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notificación no encontrada');

    await this.prisma.notification.delete({ where: { id } });
  }

  /** Llega por TCP: NOT-10, obtener preferencias (con default si no existen) */
  async getPreferences(userId: string) {
    const existing = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    if (existing) return existing;

    return this.prisma.notificationPreference.create({
      data: { userId, realtimeEnabled: true },
    });
  }

  /** Llega por TCP: NOT-10, actualizar preferencias */
  async updatePreferences(userId: string, dto: UpdatePreferenceDto) {
    await this.getPreferences(userId); // asegura que exista

    return this.prisma.notificationPreference.update({
      where: { userId },
      data: dto,
    });
  }

  /** Respeta la preferencia de tiempo real del usuario antes de emitir por WS */
  private async dispatchRealtime(notification: { userId: string; type: string }) {
    const prefs = await this.getPreferences(notification.userId);
    const channels = (prefs.channels ?? {}) as Record<string, boolean>;
    const typeEnabled = channels[notification.type] ?? true;

    if (prefs.realtimeEnabled && typeEnabled) {
      this.gateway.emitToUser(notification.userId, notification);
    }
  }
}