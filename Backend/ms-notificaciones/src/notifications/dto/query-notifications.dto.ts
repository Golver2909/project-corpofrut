import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { NotificationType } from '../../contracts/notification.contract';

export class QueryNotificationsDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}