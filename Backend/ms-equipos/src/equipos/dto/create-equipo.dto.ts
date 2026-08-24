import { IsString, MinLength } from 'class-validator';

export class CreateEquipoDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  captainUserId!: string;
}