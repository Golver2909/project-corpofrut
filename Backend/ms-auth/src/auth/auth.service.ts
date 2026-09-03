import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthTokensResponse,
  ValidateSessionResponse,
} from '../contracts/auth.contract';

const REFRESH_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokensResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = await this.usersService.createUsuario(dto);
    return this.issueTokens(user.id, user.email, user.role.name);
  }

  async login(dto: LoginDto): Promise<AuthTokensResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await this.usersService.validatePassword(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.issueTokens(user.id, user.email, user.role.name);
  }

  async refresh(refreshToken: string): Promise<AuthTokensResponse> {
    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const session = await this.sessionsService.get(payload.sub);
    if (!session) {
      throw new UnauthorizedException('Sesión no encontrada');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!tokenMatches) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario inválido');
    }

    return this.issueTokens(user.id, user.email, user.role.name);
  }

  async validateSession(accessToken: string): Promise<ValidateSessionResponse> {
    let payload: { sub: string; jti: string; email: string; role: string };
    try {
      payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const session = await this.sessionsService.get(payload.sub);
    if (!session || session.jti !== payload.jti) {
      throw new UnauthorizedException('Sesión inválida o cerrada');
    }

    return { userId: payload.sub, email: payload.email, role: payload.role as any };
  }

  async logout(userId: string): Promise<void> {
    await this.sessionsService.destroy(userId);
  }

  private async issueTokens(userId: string, email: string, role: string): Promise<AuthTokensResponse> {
    const jti = randomUUID();

    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, role, jti },
      {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
      },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, REFRESH_SALT_ROUNDS);
    const ttlSeconds = this.parseExpiresInToSeconds(this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN'));

    await this.sessionsService.create(userId, { jti, refreshTokenHash }, ttlSeconds);

    return { accessToken, refreshToken, user: { id: userId, email, role: role as any } };
  }

  private parseExpiresInToSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600;
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * multipliers[unit];
  }
}