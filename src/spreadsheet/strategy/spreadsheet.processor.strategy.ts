import { Inject, Injectable } from '@nestjs/common';
import { IMPORT_SPREADSHEET_XLSX } from './importxlsx';
import type { ImportSpreadsheet } from './import-spreadsheet.interface';
import { IMPORT_SPREADSHEET_CSV } from './importcsv';

@Injectable()
export class SpreadsheetProcessorStrategy {
  constructor(
    @Inject(IMPORT_SPREADSHEET_XLSX)
    private readonly importSpreadsheetXlsx: ImportSpreadsheet,
    @Inject(IMPORT_SPREADSHEET_CSV)
    private readonly importSpreadsheetCsv: ImportSpreadsheet,
  ) {}

  async processSpreadsheet(
    file: Express.Multer.File,
    service: string,
    status: string,
  ) {
    const extension = file.originalname.split('.').pop().toLowerCase();

    if (extension === 'xlsx') {
      return this.importSpreadsheetXlsx.importSpreadsheet(file, service);
    } else if (extension === 'csv') {
      return this.importSpreadsheetCsv.importSpreadsheet(file, service);
    } else {
      throw new Error('Unsupported file type');
    }
  }
}