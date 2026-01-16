import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './model/team.entity';
import { TeamRepository } from './repository/team.repository';
import { TeamService } from './service/team.service';
import { TeamController } from './controller/team.controller';

@Module({
    imports:[
        TypeOrmModule.forFeature([Team])
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
