import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { Team } from "../model/team.entity";

@Injectable()
export class TeamRepository {
    constructor(
        @InjectRepository(Team)
        private readonly teamRepository: Repository<Team>
    ){}

    async createTeam(teamName: string): Promise<Team>{
        try{
            const newTeam = this.teamRepository.create({name: teamName});
            return this.teamRepository.save(newTeam);
        }catch(error){
          if(error instanceof QueryFailedError) throw new ConflictException('Team already exists');
          throw error;
        }
    }

    async findById(id: number): Promise<Team | null> {
        return this.teamRepository.findOne({
        where: { id },
        });
    }
}