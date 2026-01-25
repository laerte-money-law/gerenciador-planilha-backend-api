import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './model/user.entity';
import { UserService } from './service/user.service';
import { UserRepository } from './repository/user.repository';
import { UserController } from './controller/user.controller';
import { TeamRepository } from 'src/team/repository/team.repository';
import { TeamModule } from 'src/team/team.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        TeamModule
    ],
    providers: [UserRepository, UserService],
    controllers:[UserController],
    exports: [
        UserService,
    ]
})
export class UsersModule {}
