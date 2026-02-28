import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../model/client.entity';
import { ClientOutputDto } from '../model/dto/client.ouput.dto';
import { ExternalCNPJSearchData } from './external-cnpj-search.service';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly externalCNPJSearchData: ExternalCNPJSearchData,
  ) {}

  async createClient(clientData: Partial<Client>): Promise<Client> {
    const newClient = this.clientRepository.create(clientData);
    return await this.clientRepository.save(newClient);
  }

  async getAllClients(): Promise<ClientOutputDto[]> {
    const clients = await this.clientRepository.find();
    return clients.map((client) => {
      const dto = new ClientOutputDto();
      dto.id = client.id;
      dto.companyName = client.companyName;
      dto.cnpj = client.cnpj;
      dto.address = client.address;
      dto.neighborhood = client.neighborhood;
      dto.city = client.city;
      dto.state = client.state;
      dto.cep = client.cep;
      dto.contactEmail = client.contactEmail;
      dto.contactName = client.contactName;
      dto.contactPhone = client.contactPhone;
      return dto;
    });
  }

  async getCnpjInfo(cnpj: string){
    return await this.externalCNPJSearchData.getCnpjInfo(cnpj);
  }
}

