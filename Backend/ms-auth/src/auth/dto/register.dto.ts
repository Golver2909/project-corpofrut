import { IsEmail, IsInt, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsInt()
  dni!: number;

  @IsString()
  @MinLength(3)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}