import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { NOTIFICATIONS_RABBITMQ_QUEUE } from './contracts/notification.contract';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Validación global de DTOs (aplica tanto a REST/WS como a los mensajes TCP/RabbitMQ)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // TCP: acá escucha ms-gateway (historial, marcar leída, eliminar, preferencias)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: envs.notificationsTcpPort,
    },
  });

  // RabbitMQ: acá escuchan los eventos de Torneos/Inscripciones/Equipos/Fixture
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [envs.rabbitmqUrl],
      queue: NOTIFICATIONS_RABBITMQ_QUEUE,
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();

  // HTTP + WebSocket (tiempo real hacia el frontend)
  await app.listen(envs.port);

  const logger = new Logger('Bootstrap');
  logger.log(`HTTP + WebSocket escuchando en el puerto ${envs.port}`);
  logger.log(`TCP escuchando en el puerto ${envs.notificationsTcpPort}`);
  logger.log(`RabbitMQ conectado a la cola "${NOTIFICATIONS_RABBITMQ_QUEUE}"`);
}

bootstrap();