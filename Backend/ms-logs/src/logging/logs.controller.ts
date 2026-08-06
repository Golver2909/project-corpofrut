import { Controller } from '@nestjs/common';
import { LogsService } from './logs.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateLogDto } from './dto/create-log.dto';

@Controller()
export class LogsController {
    constructor(private readonly logsService: LogsService) { }

    @EventPattern('log.create')
    create(@Payload() createLogDto: CreateLogDto) {
        return this.logsService.createLog(createLogDto)
    }

}
