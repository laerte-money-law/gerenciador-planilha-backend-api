import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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
}