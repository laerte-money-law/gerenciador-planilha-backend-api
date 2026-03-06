import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/security/role/role.decorator';
import { Role } from 'src/security/role/role.enum';
import { RolesGuard } from 'src/security/role/role.guard';
import { UpdateUserDto } from '../model/dto/update-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Post('users')
  createUser(@Body() newUser: CreateUserDto) {
    return this.userService.createUser(newUser);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('users')
  getAllUsers( 
    @Query('page') page = 1,
    @Query('limit') limit = 10) {
    return this.userService.getAllUsers(page, limit);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('users/:id')
  updateUser(
    @Param('id') id: number,
    @Body() dto: UpdateUserDto
  ) {
    return this.userService.updateUser(id, dto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('users/:id')
  deleteUser(
    @Param('id') id: number
  ) {
    return this.userService.deleteUser(id);
  }
}
