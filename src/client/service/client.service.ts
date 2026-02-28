import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../model/client.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async createClient(clientData: Partial<Client>): Promise<Client> {
    const newClient = this.clientRepository.create(clientData);
    return await this.clientRepository.save(newClient);
  }
}

