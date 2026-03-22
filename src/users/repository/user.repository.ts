import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../model/user.entity";
import { QueryFailedError, Repository } from "typeorm";
import { TeamRepository } from "src/team/repository/team.repository";
import { PaginatedResponseDto } from "src/shared/dto/paginated-response.dto";
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly teamRepository: TeamRepository,
    ) { }

    async createUser(newUser: User): Promise<User> {
        try {
            const team = await this.teamRepository.findById(newUser.team.id);
            if (!team) throw new NotFoundException('Team not found');
            newUser.team = team;
            return await this.userRepository.save(newUser)

        } catch (error) {
            if (error instanceof QueryFailedError) throw new ConflictException(error.message);
            throw error;
        }
    }

    async findUserByEmail(email: string): Promise<User | null> {
        try {
            return await this.userRepository.findOne({
                where: { email },
                relations: ['team', 'client']
            });
        } catch (error) {
            if (error instanceof QueryFailedError) throw new ConflictException(error.message);
            throw error;
        }
    }

    async getAllUsers(page: number, limit: number, clientId?: number): Promise<PaginatedResponseDto<User>> {

        const skip = (page - 1) * limit;

        try {
            const whereClause = clientId ? { client: { id: clientId } } : {};

            const [items, total] = await this.userRepository.findAndCount({
                where: whereClause,
                relations: ['team', 'client'],
                skip,
                take: limit
            });

            return {
                data: items,
                page,
                limit,
                total
            };

        } catch (error) {

            if (error instanceof QueryFailedError) {
                throw new ConflictException(error.message);
            }

            throw error;
        }

    }

    async updateUser(id: number, dto: any) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['team', 'client']
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }
        if (dto.teamId) {
            const team = await this.teamRepository.findById(dto.teamId);

            if (!team) {
                throw new NotFoundException("Team not found");
            }

            user.team = team;
        }

        if (dto.name) {
            user.name = dto.name;
        }

        if (dto.email) {
            user.email = dto.email;
        }

        if (dto.role) {
            user.role = dto.role;
        }

        if (dto.teamId) {
            user.team = { id: dto.teamId } as any;
        }

        if (dto.password) {
            user.password = await bcrypt.hash(dto.password, 10);
        }

        if (dto.shouldRedefinePassword !== undefined) {
            user.shouldRedefinePassword = dto.shouldRedefinePassword;
        }

        return this.userRepository.save(user);
    }

    async deleteUser(id: number) {
        const user = await this.userRepository.findOne({
            where: { id }
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        await this.userRepository.delete(id);

        return {
            message: 'Usuário removido com sucesso'
        };
    }
}
