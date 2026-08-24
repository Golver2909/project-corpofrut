import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogDto } from './dto/create-log.dto';
import { ReadLogsDto } from './dto/read-logs.dto';

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

    async readLogs(readLogsDto: ReadLogsDto) {
        const { type, service, from, to, page = 1, limit = 20 } = readLogsDto;

        const where: any = {
            ...(type && { type }),
            ...(service && { service }),
        };

        if (from || to) {
            where.timestamp = {};

            if (from) where.timestamp.gte = new Date(from);
            if (to) where.timestamp.lte = new Date(to);
        }

        return await this.prisma.log.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                timestamp: 'desc',
            },
        });
    }
}
