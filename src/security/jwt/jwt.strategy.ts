import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET') || "SecretExample@1231",
      issuer: config.get<string>('JWT_ISSUER') || "JwtIssuerExample",
      audience: config.get<string>('JWT_AUDIENCE') || "JwtAudience123"
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      teamId: payload.teamId,
      role: payload.role,
    };
  }
}
