import { IsString } from 'class-validator';

export class LockTeamDto {
  @IsString()
  teamId!: string;
}