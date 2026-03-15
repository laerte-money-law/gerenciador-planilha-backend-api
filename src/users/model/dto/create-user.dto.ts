import { Expose } from "class-transformer";
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Role } from "src/security/role/role.enum";

export class CreateUserDto {
    @IsString()
    name: string

    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @Expose({ name: 'team_id' })
    @IsNumber()
    teamId: number

    @Expose({ name: 'client_id' })
    @IsNumber()
    @IsOptional()
    clientId?: number

    @IsNotEmpty()
    @IsEnum(Role)
    role: Role
}