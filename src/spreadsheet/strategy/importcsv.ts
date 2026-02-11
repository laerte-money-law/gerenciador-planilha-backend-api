import { ImportSpreadsheet } from './import-spreadsheet.interface';
import { Injectable } from '@nestjs/common';

export const IMPORT_SPREADSHEET_CSV = 'IMPORT_SPREADSHEET_CSV';

@Injectable()
export class ImportSpreadsheetCSV implements ImportSpreadsheet {
  importSpreadsheet(file: Express.Multer.File, service: string) {}
}