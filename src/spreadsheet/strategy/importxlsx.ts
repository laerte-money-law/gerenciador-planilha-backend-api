import { ImportSpreadsheet } from './import-spreadsheet.interface';
import { Injectable } from '@nestjs/common';

export const IMPORT_SPREADSHEET_XLSX = 'IMPORT_SPREADSHEET_XLSX';

@Injectable()
export class ImportSpreadsheetXlsx implements ImportSpreadsheet {
  importSpreadsheet(file: Express.Multer.File, service: string) {}
}
