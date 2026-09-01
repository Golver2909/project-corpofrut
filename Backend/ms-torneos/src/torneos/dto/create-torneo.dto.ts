import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { FormatoTorneo } from '@prisma/client';

export class CreateTorneoDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsString()
  @MinLength(2)
  deporte: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDateString()
  fechaInicio: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsEnum(FormatoTorneo)
  formato: FormatoTorneo;

  @IsInt()
  @Min(2)
  maxParticipantes: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  minParticipantes?: number;
}