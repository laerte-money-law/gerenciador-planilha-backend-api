import { Body, Controller, Delete, Get, Param, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { SpreadsheetService } from './spreadsheets.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/security/role/role.guard';
import { Roles } from 'src/security/role/role.decorator';
import { Role } from 'src/security/role/role.enum';
import { CreateSpreadsheetDto } from './model/dto/createSpreadsheet.dto';
import { SpreadsheetFiltersDto } from './model/dto/create-spreadsheet-filter.dto';
import { AddColumnDto } from './model/dto/add-column.dto';
import { DeleteColumnDto } from './model/dto/delete-column.dto';
import { StreamableFile } from '@nestjs/common';
import { UserLoggedDto } from '../auth/user-logged.dto';

@Controller('spreadsheets')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SpreadsheetController {
  constructor(private readonly spreadsheetService: SpreadsheetService) { }

  @Post('/import')
  @Roles(Role.ADMIN, Role.USER)
  @UseInterceptors(FileInterceptor('file'))
  async importSpreadsheet(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateSpreadsheetDto,
  ) {

    return this.spreadsheetService.importSpreadsheetV2(
      req.user,
      file,
      body.teamId,
      body.clientId,
      body.service,
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.USER, Role.CLIENT)
  async getSpreadsheets(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userLogged: UserLoggedDto = req.user;
    return this.spreadsheetService.getSpreadsheets(
      userLogged,
      Number(page),
      Number(limit),
    );
  }

  @Delete('/:spreadsheetId')
  @Roles(Role.ADMIN)
  async deleteSpreadsheet(@Param('spreadsheetId') id: string) {
    return this.spreadsheetService.deleteSpreadsheet(id);
  }

  @Get('/:spreadsheetId')
  @Roles(Role.ADMIN, Role.USER, Role.CLIENT)
  async getSpreadsheet(
    @Param('spreadsheetId') id: string,
    @Req() req: any,
    @Query() filters: SpreadsheetFiltersDto,
  ) {
    const userLogged: UserLoggedDto = req.user;
    return this.spreadsheetService.getSpreadsheetByIdPaginatedV2(
      id,
      userLogged,
      filters,
    );
  }

  @Post('/:spreadsheetId/column')
  async addColumn(
    @Param('spreadsheetId') spreadsheetId: string,
    @Body() addColumnDto: AddColumnDto,
  ) {
    return this.spreadsheetService.addColumnToSpreadsheet(
      spreadsheetId,
      addColumnDto,
    );
  }

  @Delete('/:spreadsheetId/column')
  async deleteColumn(
    @Param('spreadsheetId') spreadsheetId: string,
    @Body() deleteColumnDto: DeleteColumnDto,
  ) {
    return this.spreadsheetService.deleteColumnFromSpreadsheet(
      spreadsheetId,
      deleteColumnDto,
    );
  }

  @Get('/:spreadsheetId/columns')
  async getSpreadsheetColumns(
    @Param('spreadsheetId') spreadsheetId: string,
    @Req() req: any,
  ) {
    const userLogged: UserLoggedDto = req.user;
    return this.spreadsheetService.getSpreadsheetColumns(
      spreadsheetId,
      userLogged,
    );
  }

  @Post('/:spreadsheetId/:rowId')
  async updateSpreadsheetRow(
    @Param('spreadsheetId') spreadsheetId: string,
    @Param('rowId') rowId: string,
    @Body() updateData: Record<string, string>,
  ) {
    return this.spreadsheetService.updateSpreadsheetRow(
      spreadsheetId,
      Number(rowId),
      updateData,
    );
  }

  @Get('/:spreadsheetId/export')
  async exportSpreadsheet(@Param('spreadsheetId') id: string, @Req() req: any) {
    const userLogged: UserLoggedDto = req.user;
    const result = await this.spreadsheetService.exportSpreadsheet(
      id,
      userLogged,
    );

    return new StreamableFile(result.buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(result.fileName)}`,
    });
  }
}
