import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { NOTIFICATIONS_RABBITMQ_QUEUE } from './contracts/notification.contract';

async function bootstrap() {
  // ✅ Crear app SOLO para microservicios (sin HTTP REST)
  const app = await NestFactory.create(AppModule, {
    cors: false, // No exponer CORS innecesariamente
  });

  // Validación global de DTOs (aplica tanto a WS como a los mensajes TCP/RabbitMQ)
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

  // ✅ Iniciar TODOS los microservicios (TCP + RabbitMQ + WebSocket)
  await app.startAllMicroservices();

  // WebSocket (tiempo real hacia el frontend)
  // ⚠️ NO abre HTTP REST, solo WebSocket en el namespace /notifications
  const logger = new Logger('Bootstrap');
  
  logger.log(`🚀 ms-notificaciones iniciado`);
  logger.log(`📡 WebSocket escuchando en puerto ${envs.port} (namespace: /notifications)`);
  logger.log(`🔌 TCP escuchando en puerto ${envs.notificationsTcpPort}`);
  logger.log(`🐰 RabbitMQ conectado a la cola "${NOTIFICATIONS_RABBITMQ_QUEUE}"`);
  logger.log(`✅ SEGURIDAD: HTTP REST NO expuesto (solo microservicios internos)`);
}

bootstrap().catch((err) => {
  console.error('❌ Error al iniciar ms-notificaciones:', err);
  process.exit(1);
});