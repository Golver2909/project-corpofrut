import { IsBoolean, IsObject, IsOptional } from 'class-validator';
import { NotificationType } from '../../contracts/notification.contract';

export class UpdatePreferenceDto {
  @IsOptional()
  @IsBoolean()
  realtimeEnabled?: boolean;

  @IsOptional()
  @IsObject()
  channels?: Partial<Record<NotificationType, boolean>>;
}