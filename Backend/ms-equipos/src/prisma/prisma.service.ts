import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Envuelve a PrismaClient como un provider de NestJS.
 * Al extender PrismaClient, esta clase ya tiene todos los métodos
 * (this.equipo.create(), this.equipo.findMany(), etc.) generados
 * automáticamente a partir de schema.prisma.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Conectado a PostgreSQL vía Prisma');
  }
}