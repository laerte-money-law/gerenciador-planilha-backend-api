import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TeamDto {
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be an empty string' })
  name: string;

  @IsNumber()
  @IsOptional()
  clientId: number;
}
