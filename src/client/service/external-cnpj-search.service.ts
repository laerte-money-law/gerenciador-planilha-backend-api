import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ExternalCNPJSearchData {
  constructor(private readonly httpService: HttpService) {}

  async getCnpjInfo(cnpj: string): Promise<any> {

    const response = this.httpService.get(
      'https://www.receitaws.com.br/v1/cnpj/' + cnpj,
    );

    return await firstValueFrom(response);
  }
}
