import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './model/team.entity';
import { TeamRepository } from './repository/team.repository';
import { TeamService } from './service/team.service';
import { TeamController } from './controller/team.controller';
import { SecurityModule } from 'src/security/security.module';

@Module({
    imports:[
        TypeOrmModule.forFeature([Team]), SecurityModule
    ],
    providers:[
        TeamRepository,
        TeamService
    ],
    controllers: [TeamController],
    exports: [
        TeamRepository,
    ]
})
export class TeamModule {}
