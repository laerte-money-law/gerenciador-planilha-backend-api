import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../repository/user.repository";
import { CreateUserDto } from "../model/dto/create-user.dto";
import { userMapperToBodyResponse, userMapperToResponseDto, usertMapperToEntity } from "../model/mapper/user.mapper";
import { CreateUserResponseDto } from "../model/dto/create-user.response.dto";
import * as bcrypt from 'bcryptjs';
import { UserResponseDto } from "../model/dto/user-response.dto";
import { PaginatedResponseDto } from "src/shared/dto/paginated-response.dto";
import { UpdateUserDto } from "../model/dto/update-user.dto";

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

    async getAllUsers(page: number, limit: number): Promise<PaginatedResponseDto<UserResponseDto>> {
        const result = await this.userRepository.getAllUsers(page, limit);

        return {
            data: result.data.map(user => userMapperToResponseDto(user)),
            page: result.page,
            limit: result.limit,
            total: result.total
        };

    }

    async updateUser(id: number, dto: UpdateUserDto) {
        return await this.userRepository.updateUser(id, dto);
  }

  async deleteUser(id: number) {

    return await this.userRepository.deleteUser(id);

  }


}