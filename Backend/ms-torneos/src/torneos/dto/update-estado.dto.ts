import { IsEnum } from 'class-validator';
import { EstadoTorneo } from '@prisma/client';

export class UpdateEstadoDto {
  @IsEnum(EstadoTorneo)
  estado: EstadoTorneo;
}