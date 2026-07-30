import { IsArray, IsEnum, IsIn, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../../contracts/notification.contract';
import type { SourceService } from '../../contracts/notification.contract';

const SOURCE_SERVICES: SourceService[] = [
  'auth',
  'torneos',
  'inscripciones',
  'equipos',
  'fixture',
  'notificaciones',
];

/**
 * Igual que CreateNotificationDto pero para enviar la misma notificación
 * a varios usuarios a la vez (ej. avisar a todo un equipo de un cambio).
 */
export class CreateBulkNotificationDto {
  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsArray()
  @IsString({ each: true })
  userIds!: string[];

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  tournamentId?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @IsIn(SOURCE_SERVICES)
  sourceService!: SourceService;
}