import { IsEnum, IsString, IsOptional, IsObject, IsIn } from 'class-validator';
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

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  userId!: string;

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