export class GetSpreadsheetColumnsResponseDto {
  id: string;
  name: string;
  columns: string[];

  constructor(id: string, name: string, columns: string[]) {
    this.id = id;
    this.name = name;
    this.columns = columns;
  }

}

