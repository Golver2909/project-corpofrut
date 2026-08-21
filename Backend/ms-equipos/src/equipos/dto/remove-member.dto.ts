import { IsString } from 'class-validator';

export class RemoveMemberDto {
  @IsString()
  teamId!: string;

  @IsString()
  requesterUserId!: string;

  @IsString()
  memberUserId!: string;
}