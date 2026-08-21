import { IsArray, IsString } from 'class-validator';

export class FindByIdsDto {
  @IsArray()
  @IsString({ each: true })
  teamIds!: string[];
}
