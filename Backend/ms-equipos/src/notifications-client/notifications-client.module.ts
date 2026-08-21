import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from '../config/envs';

import { NotificationsClientService } from './notifications-client.service';

/** El nombre de la cola de Notificaciones, tal cual está en su propio contrato */
const NOTIFICATIONS_RABBITMQ_QUEUE = 'notifications_queue';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [envs.rabbitmqUrl],
          queue: NOTIFICATIONS_RABBITMQ_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [NotificationsClientService],
  exports: [NotificationsClientService],
})
export class NotificationsClientModule {}