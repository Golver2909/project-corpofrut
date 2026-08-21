import { IsOptional, IsString } from 'class-validator';

export class DisableEquipoDto {
  @IsString()
  teamId!: string;

  @IsString()
  requesterUserId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}