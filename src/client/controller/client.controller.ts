import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientService } from '../service/client.service';
import { ClientSaveInputDto } from '../model/dto/client-save.input.dto';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createClient(@Body() clientSaveInputDto: ClientSaveInputDto) {
    return await this.clientService.createClient(clientSaveInputDto);
  }
}

