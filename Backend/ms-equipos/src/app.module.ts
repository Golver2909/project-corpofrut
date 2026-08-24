import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EquiposModule } from './equipos/equipo.module';
import { NotificationsClientModule } from './notifications-client/notifications-client.module';

@Module({
  imports: [PrismaModule, EquiposModule, NotificationsClientModule],
})
export class AppModule {}