import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsEventsController } from './notifications.events.controller';
import { NotificationsRpcController } from './notifications.rpc.controller';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  controllers: [NotificationsEventsController, NotificationsRpcController],
  providers: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}