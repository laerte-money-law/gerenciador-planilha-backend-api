import { Injectable } from '@nestjs/common';
import { TeamRepository } from '../repository/team.repository';
import { TeamDto } from '../model/dto/teamDto';
import { Team } from '../model/team.entity';
import { UserLoggedDto } from 'src/auth/user-logged.dto';
import { Role } from 'src/security/role/role.enum';

@Injectable()
export class TeamService {
  constructor(private readonly teamRepository: TeamRepository) {}

  createTeam(team: TeamDto): Promise<Team> {
    return this.teamRepository.createTeam(team.name, team.clientId);
  }

  getAllTeams(
    userLogged: UserLoggedDto,
    clientIdFilter?: number,
  ): Promise<Team[]> {
    if (userLogged.role === Role.CLIENT) {
      const data = this.teamRepository.findAllTeams(userLogged.clientId);
      return data;
    }
    return this.teamRepository.findAllTeams(clientIdFilter);
  }
}
