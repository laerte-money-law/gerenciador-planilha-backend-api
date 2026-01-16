import { Body, Controller, Get, Param, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { SpreadsheetService } from './spreadsheets.service';
import { UpdateCellDto } from './model/dtos/cell-dto/update-cell.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';


@Controller()
export class SpreadsheetController {
  constructor(
    private readonly spreadsheetService: SpreadsheetService,
  ) {}

  @Patch('cells')
  async updateCell(
    @Body() dto: UpdateCellDto,
  ): Promise<void> {
    const userId = 1;

    await this.spreadsheetService.updateCell({
      rowId: dto.rowId,
      columnId: dto.columnId,
      value: dto.value,
      userId,
    });
  }

  @Get('spreadsheets/:id/rows')
  async getRows(
    @Param('id') spreadsheetId: number,
    @Query('status') status = 'IN_PROGRESS',
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return this.spreadsheetService.getRows({
      spreadsheetId: Number(spreadsheetId),
      status,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  }

    @Post('import')
    @UseInterceptors(FileInterceptor('file'))
    async importCsv(
      @UploadedFile() file: Express.Multer.File,
    ) {
      return this.spreadsheetService.importCsv(file);
    }

  @Get(':id/export')
  async export(
    @Param('id') spreadsheetId: number,
    @Res() res: Response,
  ) {
    const csv = await this.spreadsheetService.exportSpreadsheet(
      Number(spreadsheetId),
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="spreadsheet-${spreadsheetId}.csv"`,
    );

    res.send(csv);
  }



}
