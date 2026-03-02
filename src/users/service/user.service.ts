import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repository/user.repository";
import { CreateUserDto } from "../model/dto/create-user.dto";
import { userMapperToBodyResponse, userMapperToResponseDto, usertMapperToEntity } from "../model/mapper/user.mapper";
import { CreateUserResponseDto } from "../model/dto/create-user.response.dto";
import * as bcrypt from 'bcryptjs';
import { UserResponseDto } from "../model/dto/user-response.dto";

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository
    ){}

    async createUser(userDto: CreateUserDto): Promise<CreateUserResponseDto>{
        const hashedPassword = await bcrypt.hash(userDto.password, 10);
        userDto.password = hashedPassword
        const savedUser = await this.userRepository.createUser(usertMapperToEntity(userDto));
        return userMapperToBodyResponse(savedUser);
    }

    async findUserByEmail(email: string){
        return await this.userRepository.findUserByEmail(email);
    }
    async getAllUsers():Promise<UserResponseDto[]>{
        const usersList =  await this.userRepository.getAllUsers();
        return usersList.map(user => userMapperToResponseDto(user));
    }
}