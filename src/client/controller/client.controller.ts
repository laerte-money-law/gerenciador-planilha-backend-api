import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllClients() {
    return await this.clientService.getAllClients();
  }

  @Get('/:clientId')
  @UseGuards(AuthGuard('jwt'))
  async getClientById(@Body('clientId') clientId: number) {
    console.log("Ta rodando aqui")
    console.log(clientId);
    return await this.clientService.getClientById(clientId);
  }

  @Get('/:clientId/users')
  @UseGuards(AuthGuard('jwt'))
  async getUsersByClientId(@Body('clientId') clientId: number) {
    return await this.clientService.getUsersByClientId(clientId);
  }

}

