import { SpreadsheetRowDto } from './spreadsheet-row.dto';

export class SpreadsheetViewResponseDto {
  id: string;
  name: string;
  columns: string[];
  page: number;
  limit: number;
  total: number;
  rows: SpreadsheetRowDto[];
}
