import { Controller } from '@nestjs/common';
import { LogsService } from './logs.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateLogDto } from './dto/create-log.dto';
import { ReadLogsDto } from './dto/read-logs.dto';

@Controller()
export class LogsController {
    constructor(private readonly logsService: LogsService) { }

    @EventPattern('log.create')
    create(@Payload() createLogDto: CreateLogDto) {
        return this.logsService.createLog(createLogDto)
    }

    @MessagePattern({ log: 'readLogs' })
    readLogs(@Payload() readLogsDto: ReadLogsDto) {
        return this.logsService.readLogs(readLogsDto);
    }
}
