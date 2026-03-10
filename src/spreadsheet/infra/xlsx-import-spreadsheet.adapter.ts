import { ImportSpreadsheetPort } from '../contracts/import-spreadsheet.port';
import { ColumnDto } from '../model/dto/column.dto';
import { Injectable } from '@nestjs/common';
import XLSX from 'xlsx';

@Injectable()
export class XlsxImportSpreadsheetAdapter implements ImportSpreadsheetPort {

  private headers: string [] = [];
  private rows: string[][] = [];

  constructor(file: Express.Multer.File) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const arr: any[] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
    });

    const records = arr.map((row) => row.map((cell) => cell?.toString() ?? ''));

    const [header, ...rows] = records;
    this.headers = header;
    this.rows = rows;
  }

  getHeaders(): ColumnDto[] {
    return this.headers.map(header =>  new ColumnDto(header));
  }

  getRows(): string[][] {
    return this.rows;
  }
}
