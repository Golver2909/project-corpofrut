import { IsString } from 'class-validator';

export class InviteMemberDto {
  @IsString()
  teamId!: string;

  @IsString()
  requesterUserId!: string;

  @IsString()
  invitedUserId!: string;
}