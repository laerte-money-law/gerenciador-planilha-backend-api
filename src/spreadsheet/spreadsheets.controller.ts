import {  Body, Controller, Get, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { SpreadsheetService } from './spreadsheets.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/security/role/role.guard';
import { Roles } from 'src/security/role/role.decorator';
import { Role } from 'src/security/role/role.enum';
import { CreateSpreadsheetDto } from './model/dto/createSpreadsheet.dto';
import { SpreadsheetFiltersDto } from './model/dto/create-spreadsheet-filter.dto';

@Controller()
export class SpreadsheetController {
  constructor(private readonly spreadsheetService: SpreadsheetService) {}

  @Post('import')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @UseInterceptors(
    FileInterceptor('file'),
  )
  async importSpreadsheet(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateSpreadsheetDto,
  ) {

    return this.spreadsheetService.importSpreadsheet(
      file,
      1,
      1,
      body.service,
      body.status,
    );
  }

  @Get('spreadsheets')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getSpreadsheets(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { teamId, role } = req.user;
    return this.spreadsheetService.getSpreadsheets(
      role,
      teamId,
      Number(page),
      Number(limit),
    );
  }

  @Get('spreadsheets/:id')
  @UseGuards(AuthGuard('jwt'))
  async getSpreadsheet(
    @Param('id') id: string,
    @Req() req: any,
    @Query() filters: SpreadsheetFiltersDto,
  ) {
    const { role, teamId } = req.user;
    return this.spreadsheetService.getSpreadsheetByIdPaginated(
      id,
      role,
      teamId,
      filters,
    );
  }
}
