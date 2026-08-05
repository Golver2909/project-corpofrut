import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator'
import { LogType } from '@prisma/client'

export class CreateLogDto {
    @IsEnum(LogType)
    type!: LogType;

    @IsString()
    description!: string;

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    clienteIp?: string;

    @IsString()
    service!: string;

    @IsOptional()
    @IsString()
    endpoint?: string;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>

}