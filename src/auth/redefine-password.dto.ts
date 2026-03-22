import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RedefinePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
