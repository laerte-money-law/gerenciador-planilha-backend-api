import { IsNotEmpty, isNotEmpty, IsString } from "class-validator";

export class TeamDto {
    @IsString()
    @IsNotEmpty({ message: 'Name cannot be an empty string' })
    name: string
}