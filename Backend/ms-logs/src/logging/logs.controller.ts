import { Controller } from '@nestjs/common';
import { LogsService } from './logs.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateLogDto } from './dto/create-log.dto';

@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) { }

    @MessagePattern({ log: 'create' })
    create(@Payload() CreateLogDto: CreateLogDto) {
        return this.logsService.createLog(CreateLogDto)
    }

}
