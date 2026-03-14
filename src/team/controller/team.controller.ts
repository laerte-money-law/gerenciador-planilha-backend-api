import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { TeamService } from "../service/team.service";
import { TeamDto } from "../model/dto/teamDto";
import { RolesGuard } from "src/security/role/role.guard";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "src/security/role/role.decorator";
import { Role } from "src/security/role/role.enum";
import { UserLoggedDto } from "src/auth/user-logged.dto";

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.CLIENT)
export class TeamController{
    constructor(
        private readonly teamService: TeamService
    ){}
    @Post('teams')
    createTeam(@Body() newTeam: TeamDto){
        return this.teamService.createTeam(newTeam);
    }

    @Get('teams')
    getAllTeams(@Req() req: any) {
        const userLogged: UserLoggedDto = req.user;
        return this.teamService.getAllTeams(userLogged);
    }
}