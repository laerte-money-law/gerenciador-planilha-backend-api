import { ColumnDto } from '../model/dto/column.dto';

export interface ImportSpreadsheetPort  {
  getHeaders(): ColumnDto[];
  getRows(): string[][];
}