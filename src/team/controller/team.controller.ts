import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { TeamService } from "../service/team.service";
import { TeamDto } from "../model/dto/teamDto";
import { RolesGuard } from "src/security/role/role.guard";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "src/security/role/role.decorator";
import { Role } from "src/security/role/role.enum";

@Controller()
export class TeamController{
    constructor(
        private readonly teamService: TeamService
    ){}
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN)
    @Post('teams')
    createTeam(@Body() newTeam: TeamDto){
        return this.teamService.createTeam(newTeam);
    }
}