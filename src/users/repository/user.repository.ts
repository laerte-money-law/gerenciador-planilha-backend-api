import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../model/user.entity";
import { QueryFailedError, Repository } from "typeorm";
import { TeamRepository } from "src/team/repository/team.repository";

@Injectable()
export class UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly teamRepository: TeamRepository,
    ){}

    async createUser(newUser: User){
        try{
            console.log(newUser)
            const team = await this.teamRepository.findById(newUser.team.id);
            if (!team) throw new NotFoundException('Team not found');
            newUser.team = team;
            return await this.userRepository.save(newUser)

        }catch(error){
            if(error instanceof QueryFailedError) throw new ConflictException(error.message);
            throw error;
        }
    }
}
