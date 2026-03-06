import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { Role } from 'src/security/role/role.enum';

export class UpdateUserDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @Expose({ name: 'team_id' })
  @IsNumber()
  teamId?: number;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

}