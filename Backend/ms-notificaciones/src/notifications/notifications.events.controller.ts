import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CreateBulkNotificationDto } from './dto/create-bulk-notification.dto';
import { NOTIFICATION_EVENTS } from '../contracts/notification.contract';

/**
 * Escucha los eventos que publican Torneos, Inscripciones, Equipos y
 * Fixture por RabbitMQ para crear notificaciones. Son eventos
 * (fire-and-forget): no se espera una respuesta sincrónica.
 */
@Controller()
export class NotificationsEventsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(NOTIFICATION_EVENTS.CREATE)
  async handleCreate(@Payload() dto: CreateNotificationDto) {
    await this.notificationsService.create(dto);
  }

  @EventPattern(NOTIFICATION_EVENTS.CREATE_BULK)
  async handleCreateBulk(@Payload() dto: CreateBulkNotificationDto) {
    await this.notificationsService.createBulk(dto);
  }
}