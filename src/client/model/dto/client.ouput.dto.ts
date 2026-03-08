import { Client } from '../client.entity';

export class ClientOutputDto {
  id: number;
  companyName: string;
  cnpj: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: string;
  createdAt: Date;

  static fromEntity(client:Client) {
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
  }
}
