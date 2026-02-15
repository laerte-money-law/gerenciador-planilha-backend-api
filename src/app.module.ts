import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpreadsheetModule } from './spreadsheet/spreadsheets.module';
import { SecurityModule } from './security/security.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AttachmentModule } from './attachment/attachment.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        synchronize: false,
        logging: false,
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        entities: ['dist/**/*.entity.js'],
      }),
    }),

    SpreadsheetModule,
    UsersModule,
    AuthModule,
    TeamModule,
    SecurityModule,
    AttachmentModule,
  ],
})
export class AppModule {}
