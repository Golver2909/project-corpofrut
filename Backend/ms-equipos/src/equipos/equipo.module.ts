import { Module } from '@nestjs/common';
import { EquiposService } from './equipo.service';
import { EquiposRpcController } from './equipo.rpc.controller';
import { EquiposEventsController } from './equipo.events.controller';

@Module({
  controllers: [EquiposRpcController, EquiposEventsController],
  providers: [EquiposService],
})
export class EquiposModule {}