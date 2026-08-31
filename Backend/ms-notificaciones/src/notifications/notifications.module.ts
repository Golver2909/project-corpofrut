import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { NotificationsEventsController } from './notifications.events.controller';
import { NotificationsRpcController } from './notifications.rpc.controller';
import { NotificationsGateway } from './notifications.gateway';
import { envs } from '../config/envs';

@Module({
  imports: [JwtModule.register({ secret: envs.jwtSecret })],
  controllers: [NotificationsEventsController, NotificationsRpcController],
  providers: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}