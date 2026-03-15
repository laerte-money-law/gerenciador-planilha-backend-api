import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientService } from '../service/client.service';
import { ClientSaveInputDto } from '../model/dto/client-save.input.dto';
import { RolesGuard } from 'src/security/role/role.guard';
import { Roles } from 'src/security/role/role.decorator';
import { Role } from 'src/security/role/role.enum';

@Controller('clients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN, Role.CLIENT)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  async createClient(@Body() clientSaveInputDto: ClientSaveInputDto) {
    return await this.clientService.createClient(clientSaveInputDto);
  }

  @Get()
  async getAllClients() {
    return await this.clientService.getAllClients();
  }
}

