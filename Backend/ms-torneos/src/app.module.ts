import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppCacheModule } from './common/cache/app-cache.module';
import { PrismaModule } from './prisma/prisma.module';
import { TorneosModule } from './torneos/torneos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AppCacheModule,
    PrismaModule,
    TorneosModule,
  ],
})
export class AppModule {}