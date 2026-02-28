import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './model/client.entity';
import { ClientService } from './service/client.service';
import { ClientController } from './controller/client.controller';
import { ExternalCNPJSearchData } from './service/external-cnpj-search.service';
import { ConsultaCnpjController } from './controller/search-cnpj.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), HttpModule],
  controllers: [ClientController, ConsultaCnpjController],
  providers: [ClientService, ExternalCNPJSearchData],
  exports: [ClientService],
})
export class ClientModule {}
