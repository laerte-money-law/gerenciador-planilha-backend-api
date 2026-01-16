import { plainToInstance } from "class-transformer";
import { Team } from "../../../team/model/team.entity";
import { User } from "../user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { CreateUserResponseDto } from "../dto/create-user.response.dto";

export const usertMapperToEntity = (userDto: CreateUserDto): User => {
        console.log("mapper: ", userDto )

    return plainToInstance(User, {
        name: userDto.name,
        email: userDto.email,
        password: userDto.password,
        team: { id: userDto.teamId } as Team
    });
}

export const userMapperToBodyResponse = (user: User): CreateUserResponseDto=> {
    return plainToInstance(CreateUserResponseDto, {
        name: user.name,
        email: user.email,
        team: user.team
    });
}