import { Module } from "@nestjs/common";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { RolesGuard } from "./role/role.guard";

@Module({
  providers: [
    JwtStrategy,
    RolesGuard,
  ],
  exports: [
    JwtStrategy,
    RolesGuard,
  ],
})
export class SecurityModule {}
