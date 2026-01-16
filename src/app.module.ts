import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpreadsheetModule } from './spreadsheet/spreadsheets.module';
import dataSource from './database/data-source';


@Module({
  imports: [TypeOrmModule.forRoot(dataSource.options), SpreadsheetModule, UsersModule, AuthModule, TeamModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
