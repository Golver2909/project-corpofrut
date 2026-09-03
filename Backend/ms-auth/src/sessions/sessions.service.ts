import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../contracts/redis.constants';

interface SessionData {
  jti: string;
  refreshTokenHash: string;
}

@Injectable()
export class SessionsService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(userId: string): string {
    return `session:${userId}`;
  }

  async create(userId: string, data: SessionData, ttlSeconds: number): Promise<void> {
    await this.redis.set(this.key(userId), JSON.stringify(data), 'EX', ttlSeconds);
  }

  async get(userId: string): Promise<SessionData | null> {
    const raw = await this.redis.get(this.key(userId));
    return raw ? JSON.parse(raw) : null;
  }

  async destroy(userId: string): Promise<void> {
    await this.redis.del(this.key(userId));
  }
}