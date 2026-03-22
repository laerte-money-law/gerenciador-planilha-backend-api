import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { AuthGuard } from '@nestjs/passport';
import { RedefinePasswordDto } from './redefine-password.dto';
import { RedefinePasswordUseCase } from './usecase/redefine-password.usecase';
import { UserLoggedDto } from './user-logged.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redefinePasswordUseCase: RedefinePasswordUseCase,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @Post('redefine')
  @UseGuards(AuthGuard('jwt'))
  redefinePassword(@Body() dto: RedefinePasswordDto, @Req() req: any) {
    const userLogged: UserLoggedDto = req.user;
    console.log('usuario logado: ', userLogged);
    return this.redefinePasswordUseCase.execute(userLogged, dto.password);
  }
}
