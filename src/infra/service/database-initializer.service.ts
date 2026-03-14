import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Client } from '../../client/model/client.entity';
import { Team } from '../../team/model/team.entity';
import { User } from '../../users/model/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DatabaseInitializerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseInitializerService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    this.logger.log('Executing Database Initializer...');
    await this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Initialize Client
      let client = await queryRunner.manager.findOne(Client, {
        where: { cnpj: '60314282000123' },
      });

      if (!client) {
        this.logger.log('Creating default Client...');
        client = queryRunner.manager.create(Client, {
          companyName: 'MoneyLaw',
          cnpj: '60314282000123',
        });
        await queryRunner.manager.save(client);
      }

      // Initialize Team
      let team = await queryRunner.manager.findOne(Team, {
        where: { name: 'MoneyLaw-Admin' },
      });

      if (!team) {
        this.logger.log('Creating default Team...');
        team = queryRunner.manager.create(Team, {
          name: 'MoneyLaw-Admin',
        });
        await queryRunner.manager.save(team);
      }

      // Initialize User
      let user = await queryRunner.manager.findOne(User, {
        where: { email: 'admin@admin.com' },
      });

      if (!user) {
        this.logger.log('Creating default Admin User...');
        const hashedPassword = await bcrypt.hash('admin', 10);
        user = queryRunner.manager.create(User, {
          name: 'Admin',
          email: 'admin@admin.com',
          password: hashedPassword,
          role: 'ADMIN',
          client: client,
          team: team,
        });
        await queryRunner.manager.save(user);
      }
    } catch (error) {
      this.logger.error('Error initializing default data', error);
    } finally {
      await queryRunner.release();
    }
  }
}
