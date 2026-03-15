import { plainToInstance } from "class-transformer";
import { Team } from "../../../team/model/team.entity";
import { Client } from "../../../client/model/client.entity";
import { User } from "../user.entity";
import { CreateUserDto } from "../dto/create-user.dto";
import { CreateUserResponseDto } from "../dto/create-user.response.dto";
import { UserResponseDto } from "../dto/user-response.dto";

import { ClientOutputDto } from "../../../client/model/dto/client.ouput.dto";

export const usertMapperToEntity = (userDto: CreateUserDto): User => {
    return plainToInstance(User, {
        name: userDto.name,
        email: userDto.email,
        password: userDto.password,
        role: userDto.role,
        team: { id: userDto.teamId } as Team,
        client: { id: userDto.clientId } as Client
    });
}

export const userMapperToBodyResponse = (user: User): CreateUserResponseDto => {
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
        team: user.team ? {
            id: user.team.id,
            name: user.team.name
        } : null,
        client: user.client ? ClientOutputDto.fromEntity(user.client) : null,
        role: user.role
    });
}