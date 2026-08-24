import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { LogType } from '@prisma/client';

export class ReadLogsDto {

    @IsOptional()
    @IsEnum(LogType)
    type?: LogType;

    @IsOptional()
    @IsString()
    service?: string;

    @IsOptional()
    @IsString()
    from?: string;

    @IsOptional()
    @IsString()
    to?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    limit: number = 20;

}