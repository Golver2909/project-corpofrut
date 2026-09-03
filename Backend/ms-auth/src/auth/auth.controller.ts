import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { AUTH_PATTERNS } from '../contracts/auth.contract';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller()
@UseFilters(AllExceptionsFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  login(@Payload() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  register(@Payload() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH)
  refresh(@Payload() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @MessagePattern(AUTH_PATTERNS.VALIDATE_SESSION)
  validateSession(@Payload() dto: { accessToken: string }) {
    return this.authService.validateSession(dto.accessToken);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  logout(@Payload() dto: { userId: string }) {
    return this.authService.logout(dto.userId);
  }
}