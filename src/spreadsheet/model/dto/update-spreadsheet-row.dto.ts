export class UpdateSpreadsheetRowDto {
  [key: string]: any;
}

export class UpdateSpreadsheetRowResponseDto {
  updated: boolean;
  spreadsheetId: string;
  rowId: number;
  message: string;
}

