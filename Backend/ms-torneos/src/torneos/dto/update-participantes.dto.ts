import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateParticipantesDto {
  @IsInt()
  @Min(2)
  maxParticipantes: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  minParticipantes?: number;
}