import {

  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/service/user.service';
import { User } from 'src/users/model/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly issuer = 'login';
  private readonly audience = 'users';

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
  
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createToken(user);
  }

  createToken(user: User) {
    return {
      accessToken: this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          teamId: user.team.id,
          role: user.role,
        },
        {
          expiresIn: '7d',
          issuer: this.issuer,
          audience: this.audience,
        },
      ),
    };
  }
}
