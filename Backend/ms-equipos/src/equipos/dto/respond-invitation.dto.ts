import { IsBoolean, IsString } from 'class-validator';

export class RespondInvitationDto {
  @IsString()
  teamId!: string;

  @IsString()
  userId!: string;

  @IsBoolean()
  accept!: boolean;
}