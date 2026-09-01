import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { TorneosService } from './torneos.service';
import { CreateTorneoDto } from './dto/create-torneo.dto';
import { UpdateTorneoDto } from './dto/update-torneo.dto';
import { UpdateParticipantesDto } from './dto/update-participantes.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { FinalizarTorneoDto } from './dto/finalizar-torneo.dto';
import { CancelarTorneoDto } from './dto/cancelar-torneo.dto';
import { QueryTorneoDto } from './dto/query-torneo.dto';
import { GetUser } from '../common/decorators/current-user.decorator';
import type { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('torneos')
@UseGuards(AuthGuard, RolesGuard)
export class TorneosController {
  constructor(private readonly torneosService: TorneosService) {}

  @Post()
  @Roles('organizador', 'administrador')
  crear(@Body() dto: CreateTorneoDto, @GetUser() user: CurrentUser) {
    return this.torneosService.crear(dto, user);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  listar(@Query() query: QueryTorneoDto) {
    return this.torneosService.listar(query);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  obtenerUno(@Param('id') id: string) {
    return this.torneosService.obtenerUno(id);
  }

  @Patch(':id')
  @Roles('organizador', 'administrador')
  actualizar(@Param('id') id: string, @Body() dto: UpdateTorneoDto, @GetUser() user: CurrentUser) {
    return this.torneosService.actualizar(id, dto, user);
  }

  @Patch(':id/participantes')
  @Roles('organizador', 'administrador')
  actualizarParticipantes(@Param('id') id: string, @Body() dto: UpdateParticipantesDto, @GetUser() user: CurrentUser) {
    return this.torneosService.actualizarParticipantes(id, dto, user);
  }

  @Patch(':id/estado')
  @Roles('organizador', 'administrador')
  cambiarEstado(@Param('id') id: string, @Body() dto: UpdateEstadoDto, @GetUser() user: CurrentUser) {
    return this.torneosService.cambiarEstado(id, dto, user);
  }

  @Patch(':id/finalizar')
  @Roles('organizador', 'administrador')
  finalizar(@Param('id') id: string, @Body() dto: FinalizarTorneoDto, @GetUser() user: CurrentUser) {
    return this.torneosService.finalizar(id, dto, user);
  }

  @Delete(':id')
  @Roles('organizador', 'administrador')
  cancelar(@Param('id') id: string, @Body() dto: CancelarTorneoDto, @GetUser() user: CurrentUser) {
    return this.torneosService.cancelar(id, dto, user);
  }

  @Delete(':id/admin')
  @Roles('administrador')
  eliminarComoAdmin(@Param('id') id: string, @Body() dto: CancelarTorneoDto, @GetUser() user: CurrentUser) {
    return this.torneosService.eliminarComoAdmin(id, dto, user);
  }
}