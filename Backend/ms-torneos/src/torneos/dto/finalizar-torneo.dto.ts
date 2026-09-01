import { IsString, MinLength } from 'class-validator';

export class FinalizarTorneoDto {
  @IsString()
  @MinLength(1)
  ganadorId: string;
}