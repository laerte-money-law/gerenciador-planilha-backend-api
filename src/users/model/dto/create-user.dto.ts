import { Expose } from "class-transformer";
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
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

    @IsNotEmpty()
    @IsEnum(Role)
    role: Role
}