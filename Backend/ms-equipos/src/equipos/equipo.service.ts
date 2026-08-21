import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsClientService } from '../notifications-client/notifications-client.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { DisableEquipoDto } from './dto/disable-equipo.dto';
import { LockTeamDto } from './dto/lock-team.dto';
import { FindByIdsDto } from './dto/find-by-ids.dto';
import { EquipoResponse, InvitationStatus } from '../contracts/equipo.contract';

@Injectable()
export class EquiposService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsClient: NotificationsClientService,
  ) {}

  /** EQ-1: crear equipo, el creador queda como capitán */
  async create(dto: CreateEquipoDto): Promise<EquipoResponse> {
    const equipo = await this.prisma.equipo.create({
      data: {
        name: dto.name,
        miembros: {
          create: {
            userId: dto.captainUserId,
            isCaptain: true,
            status: 'ACCEPTED',
            respondedAt: new Date(),
          },
        },
        acciones: {
          create: { userId: dto.captainUserId, action: 'CREATE' },
        },
      },
      include: { miembros: true },
    });

    return this.toResponse(equipo);
  }

  /** EQ-2: invitar integrante, solo el capitán puede */
  async inviteMember(dto: InviteMemberDto): Promise<EquipoResponse> {
    await this.assertCaptainAndEditable(dto.teamId, dto.requesterUserId);

    const existing = await this.prisma.miembro.findUnique({
      where: { teamId_userId: { teamId: dto.teamId, userId: dto.invitedUserId } },
    });
    if (existing) throw new BadRequestException('El usuario ya fue invitado o es integrante');

    await this.prisma.miembro.create({
      data: { teamId: dto.teamId, userId: dto.invitedUserId, status: 'PENDING' },
    });
    await this.logAction(dto.teamId, dto.requesterUserId, 'INVITE');

    // NOT-2: avisarle al invitado por Notificaciones
    this.notificationsClient.notifyInvitation(dto.invitedUserId, dto.teamId);

    return this.getDetail(dto.teamId);
  }

  /** EQ-3: aceptar o rechazar una invitación */
  async respondInvitation(dto: RespondInvitationDto): Promise<EquipoResponse> {
    const miembro = await this.prisma.miembro.findUnique({
      where: { teamId_userId: { teamId: dto.teamId, userId: dto.userId } },
    });
    if (!miembro || miembro.status !== 'PENDING') {
      throw new NotFoundException('No hay una invitación pendiente para este usuario');
    }

    await this.prisma.miembro.update({
      where: { id: miembro.id },
      data: {
        status: dto.accept ? 'ACCEPTED' : 'REJECTED',
        respondedAt: new Date(),
      },
    });
    await this.logAction(dto.teamId, dto.userId, dto.accept ? 'ACCEPT_INVITATION' : 'REJECT_INVITATION');

    return this.getDetail(dto.teamId);
  }

  /** EQ-4: consultar plantel */
  async getRoster(teamId: string): Promise<EquipoResponse> {
    return this.getDetail(teamId);
  }

  /** EQ-7: eliminar integrante, solo el capitán puede */
  async removeMember(dto: RemoveMemberDto): Promise<EquipoResponse> {
    await this.assertCaptainAndEditable(dto.teamId, dto.requesterUserId);

    const miembro = await this.prisma.miembro.findUnique({
      where: { teamId_userId: { teamId: dto.teamId, userId: dto.memberUserId } },
    });
    if (!miembro) throw new NotFoundException('El integrante no pertenece a este equipo');
    if (miembro.isCaptain) throw new BadRequestException('El capitán no puede eliminarse a sí mismo');

    await this.prisma.miembro.delete({ where: { id: miembro.id } });
    await this.logAction(dto.teamId, dto.requesterUserId, 'REMOVE_MEMBER');

    return this.getDetail(dto.teamId);
  }

  /** EQ-9: deshabilitar equipo (lo hace el organizador, vía ms-gateway) */
  async disable(dto: DisableEquipoDto): Promise<EquipoResponse> {
    const equipo = await this.findEquipoOrThrow(dto.teamId);

    await this.prisma.equipo.update({
      where: { id: equipo.id },
      data: { isDisabled: true },
    });
    await this.logAction(dto.teamId, dto.requesterUserId, 'DISABLE', dto.reason);

    return this.getDetail(dto.teamId);
  }

  /** EQ-5: bloquear modificaciones (llega por evento RabbitMQ) */
  async lockTeam(dto: LockTeamDto): Promise<void> {
    await this.prisma.equipo.update({
      where: { id: dto.teamId },
      data: { isBlocked: true },
    });
    await this.logAction(dto.teamId, 'system', 'LOCK');
  }

  /** EQ-10: listado global, sin filtro (admin) */
  async findAll(): Promise<EquipoResponse[]> {
    const equipos = await this.prisma.equipo.findMany({ include: { miembros: true } });
    return equipos.map((e) => this.toResponse(e));
  }

  /** EQ-8: el gateway le pasa los IDs que obtuvo de Inscripciones */
  async findByIds(dto: FindByIdsDto): Promise<EquipoResponse[]> {
    const equipos = await this.prisma.equipo.findMany({
      where: { id: { in: dto.teamIds } },
      include: { miembros: true },
    });
    return equipos.map((e) => this.toResponse(e));
  }

  /** EQ-11: información detallada de un equipo */
  async getDetail(teamId: string): Promise<EquipoResponse> {
    const equipo = await this.prisma.equipo.findUnique({
      where: { id: teamId },
      include: { miembros: true },
    });
    if (!equipo) throw new NotFoundException('Equipo no encontrado');
    return this.toResponse(equipo);
  }

  // ── Helpers privados ──────────────────────────────────────────────

  private async findEquipoOrThrow(teamId: string) {
    const equipo = await this.prisma.equipo.findUnique({ where: { id: teamId } });
    if (!equipo) throw new NotFoundException('Equipo no encontrado');
    return equipo;
  }

  /** EQ-12: valida que quien pide la acción sea el capitán, y que el equipo no esté bloqueado/deshabilitado */
  private async assertCaptainAndEditable(teamId: string, requesterUserId: string) {
    const equipo = await this.findEquipoOrThrow(teamId);
    if (equipo.isBlocked || equipo.isDisabled) {
      throw new BadRequestException('El equipo no admite modificaciones en este momento');
    }

    const requester = await this.prisma.miembro.findUnique({
      where: { teamId_userId: { teamId, userId: requesterUserId } },
    });
    if (!requester?.isCaptain) {
      throw new ForbiddenException('Solo el capitán puede realizar esta acción');
    }
  }

  private async logAction(teamId: string, userId: string, action: string, reason?: string) {
    await this.prisma.equipoAction.create({
      data: { teamId, userId, action: reason ? `${action}: ${reason}` : action },
    });
  }

  private toResponse(equipo: {
    id: string;
    name: string;
    isBlocked: boolean;
    isDisabled: boolean;
    miembros: { userId: string; isCaptain: boolean; status: string }[];
  }): EquipoResponse {
    return {
      id: equipo.id,
      name: equipo.name,
      isBlocked: equipo.isBlocked,
      isDisabled: equipo.isDisabled,
      members: equipo.miembros.map((m) => ({
        userId: m.userId,
        isCaptain: m.isCaptain,
        status: m.status as InvitationStatus,
      })),
    };
  }
}