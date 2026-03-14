import { Injectable } from "@nestjs/common";
import { TeamRepository } from "../repository/team.repository";
import { TeamDto } from "../model/dto/teamDto";
import { Team } from "../model/team.entity";
import { UserLoggedDto } from "src/auth/user-logged.dto";
import { Role } from "src/security/role/role.enum";

@Injectable()
export class TeamService {
    constructor(
        private readonly teamRepository: TeamRepository
    ) { }

    createTeam(team: TeamDto): Promise<Team> {
        return this.teamRepository.createTeam(team.name);
    }

    getAllTeams(userLogged: UserLoggedDto): Promise<Team[]> {
        if (userLogged.role === Role.CLIENT) {
            return this.teamRepository.findAllTeams(userLogged.clientId);
        }
        return this.teamRepository.findAllTeams();
    }
}