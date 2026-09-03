import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionsService } from './sessions.service';
import { createRedisClient } from '../config/redis.config';
import { REDIS_CLIENT } from '../contracts/redis.constants';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService) => createRedisClient(config),
      inject: [ConfigService],
    },
    SessionsService,
  ],
  exports: [SessionsService],
})
export class SessionsModule {}