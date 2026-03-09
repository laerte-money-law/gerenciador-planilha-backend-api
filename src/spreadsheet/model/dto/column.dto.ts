export class ColumnDto {
  name: string;
  type: string;
  defaultValue: string | null;

  constructor(
    name: string,
    columnType: COLUMN_TYPE = COLUMN_TYPE.STRING,
    defaultValue?: string,
  ) {
    this.name = name;
    this.type = columnType; // Default type, can be modified as needed
    this.defaultValue = defaultValue ?? null;
  }

  public getColumnDefinitionSQL() {

    if (this.defaultValue != null) {
      return `[${this.name}] ${this.type} DEFAULT ${this.defaultValue}`;
    }

    return `[${this.name}] ${this.type}`;
  }
}

export enum COLUMN_TYPE {
  STRING = 'VARCHAR(255)',

  /*MoneyLawGEP - Common Columns Definitions*/
  PRIMARY_KEY = 'INT IDENTITY(1, 1) PRIMARY KEY',
  CREATED_AT = 'DATETIME2 DEFAULT SYSDATETIME()',
  STATUS = "VARCHAR(50)"
}