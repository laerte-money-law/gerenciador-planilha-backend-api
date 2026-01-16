import { Injectable } from "@nestjs/common";
import { TeamRepository } from "../repository/team.repository";
import { TeamDto } from "../model/dto/teamDto";
import { Team } from "../model/team.entity";

@Injectable()

export class TeamService{
    constructor(
        private readonly teamRepository: TeamRepository
    ){}

    createTeam(team: TeamDto): Promise<Team> {
        return this.teamRepository.createTeam(team.name);
    }
}