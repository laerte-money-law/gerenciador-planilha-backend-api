import { Body, Controller, Post } from "@nestjs/common";
import { TeamService } from "../service/team.service";
import { TeamDto } from "../model/dto/teamDto";

@Controller()
export class TeamController{
    constructor(
        private readonly teamService: TeamService
    ){}

    @Post('teams')
    createTeam(@Body() newTeam: TeamDto){
        return this.teamService.createTeam(newTeam);
    }
}