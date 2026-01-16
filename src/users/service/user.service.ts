import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repository/user.repository";
import { CreateUserDto } from "../model/dto/create-user.dto";
import { userMapperToBodyResponse, usertMapperToEntity } from "../model/mapper/user.mapper";
import { CreateUserResponseDto } from "../model/dto/create-user.response.dto";

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository
    ){}

    async createUser(userDto: CreateUserDto): Promise<CreateUserResponseDto>{
        const savedUser = await this.userRepository.createUser(usertMapperToEntity(userDto));
        return userMapperToBodyResponse(savedUser);
    }
}