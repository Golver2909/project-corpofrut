import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { EQUIPOS_RABBITMQ_QUEUE } from './contracts/equipo.contract';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // TCP: acá escucha ms-gateway (y Torneos/Inscripciones para consultas puntuales)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: envs.equiposTcpPort,
    },
  });

  // RabbitMQ: acá escuchan eventos entrantes (ej. Torneos avisando cierre de inscripción)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [envs.rabbitmqUrl],
      queue: EQUIPOS_RABBITMQ_QUEUE,
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(envs.port);

  const logger = new Logger('Bootstrap');
  logger.log(`HTTP escuchando en el puerto ${envs.port}`);
  logger.log(`TCP escuchando en el puerto ${envs.equiposTcpPort}`);
  logger.log(`RabbitMQ conectado a la cola "${EQUIPOS_RABBITMQ_QUEUE}"`);
}

bootstrap();