import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from '../service/team.service';
import { TeamDto } from '../model/dto/teamDto';
import { RolesGuard } from 'src/security/role/role.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/security/role/role.decorator';
import { Role } from 'src/security/role/role.enum';
import { UserLoggedDto } from 'src/auth/user-logged.dto';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.CLIENT)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}
  @Post('teams')
  createTeam(@Body() newTeam: TeamDto, @Req() req: any) {
    const userLogged: UserLoggedDto = req.user;

    if (userLogged.role === Role.ADMIN) {
      if (!newTeam.clientId) {
        throw new BadRequestException(
          'clientId must be provided when user is ADMIN',
        );
      }
    } else if (userLogged.role === Role.CLIENT) {
      newTeam.clientId = userLogged.clientId ?? 0;
    }

    return this.teamService.createTeam(newTeam);
  }

  @Get('teams')
  getAllTeams(@Req() req: any, @Query('clientId') clientId?: string) {
    const userLogged: UserLoggedDto = req.user;
    const clientIdFilter = clientId ? parseInt(clientId, 10) : undefined;
    return this.teamService.getAllTeams(userLogged, clientIdFilter);
  }
}
