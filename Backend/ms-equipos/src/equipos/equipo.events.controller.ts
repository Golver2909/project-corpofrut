import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EquiposService } from './equipo.service';
import { LockTeamDto } from './dto/lock-team.dto';
import { EQUIPO_EVENTS } from '../contracts/equipo.contract';

@Controller()
export class EquiposEventsController {
  constructor(private readonly equiposService: EquiposService) {}

  /** EQ-5: Torneos/Inscripciones avisa que se cerró el período de modificaciones */
  @EventPattern(EQUIPO_EVENTS.LOCK_TEAM)
  handleLockTeam(@Payload() dto: LockTeamDto) {
    return this.equiposService.lockTeam(dto);
  }
}