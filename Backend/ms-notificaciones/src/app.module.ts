import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LogsClientModule } from './logs-client/logs-client.module';
import { AllExceptionsFilter } from './common/exceptions/all-exceptions.filter';

@Module({
  imports: [PrismaModule, NotificationsModule, LogsClientModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}