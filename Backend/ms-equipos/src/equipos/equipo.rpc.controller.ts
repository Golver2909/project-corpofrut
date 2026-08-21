import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EquiposService } from './equipo.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { DisableEquipoDto } from './dto/disable-equipo.dto';
import { FindByIdsDto } from './dto/find-by-ids.dto';
import { EQUIPO_TCP_PATTERNS } from '../contracts/equipo.contract';

@Controller()
export class EquiposRpcController {
  constructor(private readonly equiposService: EquiposService) {}

  @MessagePattern(EQUIPO_TCP_PATTERNS.CREATE)
  create(@Payload() dto: CreateEquipoDto) {
    return this.equiposService.create(dto);
  }

  @MessagePattern(EQUIPO_TCP_PATTERNS.INVITE_MEMBER)
  inviteMember(@Payload() dto: InviteMemberDto) {
    return this.equiposService.inviteMember(dto);
  }

  @MessagePattern(EQUIPO_TCP_PATTERNS.RESPOND_INVITATION)
  respondInvitation(@Payload() dto: RespondInvitationDto) {
    return this.equiposService.respondInvitation(dto);
  }

  @MessagePattern(EQUIPO_TCP_PATTERNS.GET_ROSTER)
  getRoster(@Payload() data: { teamId: string }) {
    return this.equiposService.getRoster(data.teamId);
  }

  @MessagePattern(EQUIPO_TCP_PATTERNS.REMOVE_MEMBER)
  removeMember(@Payload() dto: RemoveMemberDto) {
    return this.equiposService.removeMember(dto);
  }

  @MessagePattern(EQUIPO_TCP_PATTERNS.DISABLE)
  disable(@Payload() dto: DisableEquipoDto) {
    return this.equiposService.disable(dto);
  }

  @MessagePattern(EQUIPO_TCP_PATTERNS.FIND_ALL)
  findAll() {
    return this.equiposService.findAll();
  }

  @MessagePattern(EQUIPO_TCP_PATTERNS.FIND_BY_IDS)
  findByIds(@Payload() dto: FindByIdsDto) {
    return this.equiposService.findByIds(dto);
  }

  @MessagePattern(EQUIPO_TCP_PATTERNS.GET_DETAIL)
  getDetail(@Payload() data: { teamId: string }) {
    return this.equiposService.getDetail(data.teamId);
  }
}