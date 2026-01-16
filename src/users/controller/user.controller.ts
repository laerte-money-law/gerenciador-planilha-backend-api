import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "../service/user.service";
import { CreateUserDto } from "../model/dto/create-user.dto";

@Controller()
export class UserController {
    constructor(
            private readonly userService: UserService
        ){}
    
        @Post('users')
        createTeam(@Body() newUser: CreateUserDto){
            return this.userService.createUser(newUser);
        }
}