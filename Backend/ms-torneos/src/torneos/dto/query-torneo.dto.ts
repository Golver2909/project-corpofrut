import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoTorneo } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryTorneoDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  deporte?: string;

  @IsOptional()
  @IsEnum(EstadoTorneo)
  estado?: EstadoTorneo;
}