import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from '../config/envs';
import { LOGS_RABBITMQ_QUEUE } from '../contracts/log.contract';
import { LogsClientService } from './logs-client.service';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'LOGS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [envs.rabbitmqUrl],
          queue: LOGS_RABBITMQ_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [LogsClientService],
  exports: [LogsClientService],
})
export class LogsClientModule {}