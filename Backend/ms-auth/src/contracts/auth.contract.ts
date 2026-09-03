import { RoleName } from '../common/enums/role.enum';

export const AUTH_PATTERNS = {
  LOGIN: 'auth.login',
  REGISTER: 'auth.register',
  REFRESH: 'auth.refresh',
  VALIDATE_SESSION: 'auth.validate-session',
  LOGOUT: 'auth.logout',
} as const;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  dni: number;
  username: string;
  email: string;
  password: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

export interface ValidateSessionPayload {
  accessToken: string;
}

export interface LogoutPayload {
  userId: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  role: RoleName;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
}

export interface ValidateSessionResponse {
  userId: string;
  email: string;
  role: RoleName;
}