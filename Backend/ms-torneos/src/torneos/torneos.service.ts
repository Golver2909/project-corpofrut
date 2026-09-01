import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoTorneo, Torneo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTorneoDto } from './dto/create-torneo.dto';
import { UpdateTorneoDto } from './dto/update-torneo.dto';
import { UpdateParticipantesDto } from './dto/update-participantes.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { FinalizarTorneoDto } from './dto/finalizar-torneo.dto';
import { CancelarTorneoDto } from './dto/cancelar-torneo.dto';
import { QueryTorneoDto } from './dto/query-torneo.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

const TRANSICIONES_VALIDAS: Record<EstadoTorneo, EstadoTorneo[]> = {
  BORRADOR: ['PUBLICADO', 'CANCELADO'],
  PUBLICADO: ['EN_CURSO', 'CANCELADO'],
  EN_CURSO: ['FINALIZADO', 'CANCELADO'],
  FINALIZADO: [],
  CANCELADO: [],
};

@Injectable()
export class TorneosService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CreateTorneoDto, user: CurrentUser): Promise<Torneo> {
    if (dto.minParticipantes && dto.minParticipantes > dto.maxParticipantes) {
      throw new BadRequestException('minParticipantes no puede ser mayor que maxParticipantes');
    }

    return this.prisma.torneo.create({
      data: {
        ...dto,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        organizadorId: user.id,
      },
    });
  }

  async listar(query: QueryTorneoDto): Promise<PaginatedResult<Torneo>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where = {
      deporte: query.deporte ? { equals: query.deporte, mode: 'insensitive' as const } : undefined,
      estado: query.estado,
      ...(query.estado ? {} : { NOT: { estado: 'CANCELADO' as const } }),
    };

    const [data, total] = await Promise.all([
      this.prisma.torneo.findMany({
        where,
        orderBy: { fechaInicio: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.torneo.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async obtenerUno(id: string): Promise<Torneo> {
    const torneo = await this.prisma.torneo.findUnique({ where: { id } });
    if (!torneo) throw new NotFoundException(`Torneo ${id} no encontrado`);
    return torneo;
  }

  private async obtenerYVerificarPermiso(id: string, user: CurrentUser): Promise<Torneo> {
    const torneo = await this.obtenerUno(id);
    this.verificarPropietarioOAdmin(torneo, user);
    return torneo;
  }

  async actualizar(id: string, dto: UpdateTorneoDto, user: CurrentUser): Promise<Torneo> {
    const torneo = await this.obtenerYVerificarPermiso(id, user);

    if (torneo.estado !== 'BORRADOR' && torneo.estado !== 'PUBLICADO') {
      throw new BadRequestException('Solo se puede editar un torneo en estado BORRADOR o PUBLICADO');
    }

    const data: any = { ...dto };
    if (dto.fechaInicio) data.fechaInicio = new Date(dto.fechaInicio);
    if (dto.fechaFin) data.fechaFin = new Date(dto.fechaFin);

    return this.prisma.torneo.update({ where: { id }, data });
  }

  async actualizarParticipantes(id: string, dto: UpdateParticipantesDto, user: CurrentUser): Promise<Torneo> {
    await this.obtenerYVerificarPermiso(id, user);

    if (dto.minParticipantes && dto.minParticipantes > dto.maxParticipantes) {
      throw new BadRequestException('minParticipantes no puede ser mayor que maxParticipantes');
    }

    return this.prisma.torneo.update({
      where: { id },
      data: {
        maxParticipantes: dto.maxParticipantes,
        minParticipantes: dto.minParticipantes,
      },
    });
  }

  async cambiarEstado(id: string, dto: UpdateEstadoDto, user: CurrentUser): Promise<Torneo> {
    const torneo = await this.obtenerYVerificarPermiso(id, user);

    const permitidos = TRANSICIONES_VALIDAS[torneo.estado];
    if (!permitidos.includes(dto.estado)) {
      throw new BadRequestException(`No se puede pasar de ${torneo.estado} a ${dto.estado}`);
    }

    return this.prisma.torneo.update({
      where: { id },
      data: { estado: dto.estado },
    });
  }

  async finalizar(id: string, dto: FinalizarTorneoDto, user: CurrentUser): Promise<Torneo> {
    const torneo = await this.obtenerYVerificarPermiso(id, user);

    if (torneo.estado !== 'EN_CURSO') {
      throw new BadRequestException('Solo se puede finalizar un torneo EN_CURSO');
    }

    return this.prisma.torneo.update({
      where: { id },
      data: { estado: 'FINALIZADO', ganadorId: dto.ganadorId },
    });
  }

  async cancelar(id: string, dto: CancelarTorneoDto, user: CurrentUser): Promise<Torneo> {
    const torneo = await this.obtenerYVerificarPermiso(id, user);
    return this.cancelarInterno(torneo, dto.motivo);
  }

  async eliminarComoAdmin(id: string, dto: CancelarTorneoDto, user: CurrentUser): Promise<Torneo> {
    if (user.role !== 'administrador') {
      throw new ForbiddenException('Solo un administrador puede usar esta acción');
    }
    const torneo = await this.obtenerUno(id);
    return this.cancelarInterno(torneo, dto.motivo);
  }

  private async cancelarInterno(torneo: Torneo, motivo: string): Promise<Torneo> {
    if (torneo.estado === 'FINALIZADO' || torneo.estado === 'CANCELADO') {
      throw new BadRequestException(`No se puede cancelar un torneo ${torneo.estado}`);
    }

    return this.prisma.torneo.update({
      where: { id: torneo.id },
      data: { estado: 'CANCELADO', motivoCancelacion: motivo },
    });
  }

  private verificarPropietarioOAdmin(torneo: Torneo, user: CurrentUser) {
    const esPropietario = torneo.organizadorId === user.id;
    const esAdmin = user.role === 'administrador';
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException('No tenés permiso para modificar este torneo');
    }
  }
}