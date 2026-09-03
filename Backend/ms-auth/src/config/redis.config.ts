import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export const createRedisClient = (config: ConfigService): Redis => {
  return new Redis(config.getOrThrow<string>('REDIS_URL'));
};