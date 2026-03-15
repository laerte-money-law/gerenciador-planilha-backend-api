import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/security/role/role.decorator';
import { Role } from 'src/security/role/role.enum';
import { RolesGuard } from 'src/security/role/role.guard';
import { UpdateUserDto } from '../model/dto/update-user.dto';
import { UserLoggedDto } from 'src/auth/user-logged.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.CLIENT)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  createUser(@Body() newUser: CreateUserDto, @Req() req: any) {
    const userLogged: UserLoggedDto = req.user;

    if (userLogged.role === Role.ADMIN) {
      if (!newUser.clientId) {
        throw new BadRequestException('clientId must be provided when user is ADMIN');
      }
    } else if (userLogged.role === Role.CLIENT) {
      newUser.clientId = userLogged.clientId;
    }

    return this.userService.createUser(newUser);
  }

  @Get()
  getAllUsers(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 10) {
    const userLogged: UserLoggedDto = req.user;
    return this.userService.getAllUsers(userLogged, page, limit);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: number) {
    return this.userService.deleteUser(id);
  }
}
