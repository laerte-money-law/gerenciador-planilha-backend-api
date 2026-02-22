import {  Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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


@Controller()
export class SpreadsheetController {
  constructor(private readonly spreadsheetService: SpreadsheetService) {}

  @Post('import')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @UseInterceptors(FileInterceptor('file'))
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

  @Post('spreadsheets/:spreadsheetId/column')
  @UseGuards(AuthGuard('jwt'))
  async addColumn(
    @Param('spreadsheetId') spreadsheetId: string,
    @Body() addColumnDto: AddColumnDto,
  ) {
    return this.spreadsheetService.addColumnToSpreadsheet(
      spreadsheetId,
      addColumnDto,
    );
  }

  @Delete('spreadsheets/:spreadsheetId/column')
  @UseGuards(AuthGuard('jwt'))
  async deleteColumn(
    @Param('spreadsheetId') spreadsheetId: string,
    @Body() deleteColumnDto: DeleteColumnDto,
  ) {
    return this.spreadsheetService.deleteColumnFromSpreadsheet(
      spreadsheetId,
      deleteColumnDto,
    );
  }

  @Get('spreadsheets/:spreadsheetId/columns')
  @UseGuards(AuthGuard('jwt'))
  async getSpreadsheetColumns(
    @Param('spreadsheetId') spreadsheetId: string,
    @Req() req: any,
  ) {
    const { role, teamId } = req.user;
    return this.spreadsheetService.getSpreadsheetColumns(
      spreadsheetId,
      role,
      teamId,
    );
  }

  @Post('spreadsheets/:spreadsheetId/:rowId')
  @UseGuards(AuthGuard('jwt'))
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

  @Get('spreadsheets/:id/export')
  @UseGuards(AuthGuard('jwt'))
  async exportSpreadsheet(
    @Param('id') id: string,
    @Req() req: any,) {
    const { role, teamId } = req.user;

    const result = await this.spreadsheetService.exportSpreadsheet(id, role, teamId);

    return new StreamableFile(result.buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename*=UTF-8''${encodeURIComponent(result.fileName)}`,
    });
  }
}
