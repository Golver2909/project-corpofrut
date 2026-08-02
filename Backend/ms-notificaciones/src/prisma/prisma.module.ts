import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global() para no tener que importar PrismaModule en cada módulo de
 * dominio (notifications, etc.) — con importarlo una vez en AppModule
 * alcanza para que PrismaService esté disponible en toda la app.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}