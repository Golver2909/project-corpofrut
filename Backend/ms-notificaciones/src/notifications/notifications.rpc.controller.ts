import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { NOTIFICATION_TCP_PATTERNS } from '../contracts/notification.contract';

/**
 * Responde a lo que le pide ms-gateway por TCP (request/response),
 * para exponerlo como REST al frontend.
 * 
 * ✅ TODOS los métodos son async y manejan errores automáticamente
 * El AllExceptionsFilter captura cualquier excepción y la envía a ms-logs
 */
@Controller()
export class NotificationsRpcController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern(NOTIFICATION_TCP_PATTERNS.FIND_ALL)
  async findAll(@Payload() query: QueryNotificationsDto) {
    return this.notificationsService.findForUser(query);
  }

  @MessagePattern(NOTIFICATION_TCP_PATTERNS.UNREAD_COUNT)
  async unreadCount(@Payload() data: { userId: string }) {
    const count = await this.notificationsService.unreadCount(data.userId);
    return { count };
  }

  @MessagePattern(NOTIFICATION_TCP_PATTERNS.MARK_AS_READ)
  async markAsRead(@Payload() data: { id: string; userId: string }) {
    return this.notificationsService.markAsRead(data.id, data.userId);
  }

  @MessagePattern(NOTIFICATION_TCP_PATTERNS.MARK_ALL_AS_READ)
  async markAllAsRead(@Payload() data: { userId: string }) {
    return this.notificationsService.markAllAsRead(data.userId);
  }

  @MessagePattern(NOTIFICATION_TCP_PATTERNS.REMOVE)
  async remove(@Payload() data: { id: string; userId: string }) {
    await this.notificationsService.remove(data.id, data.userId);
    return { success: true };
  }

  @MessagePattern(NOTIFICATION_TCP_PATTERNS.GET_PREFERENCES)
  async getPreferences(@Payload() data: { userId: string }) {
    return this.notificationsService.getPreferences(data.userId);
  }

  @MessagePattern(NOTIFICATION_TCP_PATTERNS.UPDATE_PREFERENCES)
  async updatePreferences(@Payload() data: { userId: string; dto: UpdatePreferenceDto }) {
    return this.notificationsService.updatePreferences(data.userId, data.dto);
  }
}