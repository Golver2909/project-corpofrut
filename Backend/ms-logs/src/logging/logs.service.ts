import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class LogsService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async createLog(createLogDto: CreateLogDto) {
        return await this.prisma.log.create({
            data: createLogDto,
        });
    }

}
