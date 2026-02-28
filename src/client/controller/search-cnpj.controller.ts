import { Controller, Get, Param } from '@nestjs/common';
import { ClientService } from '../service/client.service';
import { ExternalCNPJSearchData } from '../service/external-cnpj-search.service';

@Controller('cnpj')
export class ConsultaCnpjController {
  constructor(
    private readonly clientService: ClientService,
    ) {}

    @Get(':cnpj')
    async getCnpj(@Param('cnpj') cnpj: string) {
        const { data } = await this.clientService.getCnpjInfo(cnpj);
        return {
          nome: data.nome,
          fantasia: data.fantasia,
          email: data.email,
          cnpj: data.cnpj,
          nomeSocios: data.qsa,
          telefone: data.telefone,
          logradouro: data.logradouro,
          numero: data.numero,
          bairro: data.bairro,
          municipio: data.municipio,
          uf: data.uf,
          cep: data.cep,
        };
    }
}

