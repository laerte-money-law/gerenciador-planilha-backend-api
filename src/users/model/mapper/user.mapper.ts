import { plainToInstance } from "class-transformer";
import { Team } from "../../../team/model/team.entity";
import { User } from "../user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { CreateUserResponseDto } from "../dto/create-user.response.dto";
import { UserResponseDto } from "../dto/user-response.dto";

export const usertMapperToEntity = (userDto: CreateUserDto): User => {
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
export const userMapperToResponseDto = (user: User): UserResponseDto => {
    return plainToInstance(UserResponseDto, {
        id: user.id,
        name: user.name,
        email: user.email,
        team: {
            id: user.team.id,
            name: user.team.name
        },
        role: user.role
    });
}