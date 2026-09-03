import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [JwtModule.register({}), UsersModule, SessionsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}