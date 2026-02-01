import {  Controller, Get, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { SpreadsheetService } from './spreadsheets.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/security/role/role.guard';
import { Roles } from 'src/security/role/role.decorator';
import { Role } from 'src/security/role/role.enum';


@Controller()
export class SpreadsheetController {
  constructor(
    private readonly spreadsheetService: SpreadsheetService,
  ) {}

    @Post('import')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN, Role.USER)    
    @UseInterceptors(FileInterceptor('file'))
    async importCsv(
      @UploadedFile() file: Express.Multer.File,
      @Req() req: any,

    ) {
    
      const { userId, teamId } = req.user;      
      return this.spreadsheetService.importCsv(file, userId, teamId);
    }

    @Get('spreadsheets')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.ADMIN, Role.USER)
    async getSpreadsheets(
      @Req() req: any,
      @Query('page') page?: string,
      @Query('limit') limit?: string,
    ){
      const { teamId, role } = req.user;      
      return this.spreadsheetService.getSpreadsheets(role, teamId, Number(page), Number(limit));
    }


  /*@Get(':id/export')
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
*/


}
