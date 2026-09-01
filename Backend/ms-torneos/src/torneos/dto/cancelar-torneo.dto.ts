import { IsString, MinLength } from 'class-validator';

export class CancelarTorneoDto {
  @IsString()
  @MinLength(5)
  motivo: string;
}