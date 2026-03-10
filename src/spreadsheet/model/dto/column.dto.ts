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

    if (this.defaultValue != null && this.defaultValue.length > 0) {
      return `[${this.getSanitizedName()}] ${this.type} DEFAULT '${this.defaultValue}'`;
    }

    return `[${this.getSanitizedName()}] ${this.type}`;
  }

  public getSanitizedName() {
    return this.name
      .normalize('NFC') // keep UTF-8 accents normalized
      .trim()
      .replace(/\s+/g, '_') // spaces -> _
      .replace(/[^\p{L}\p{N}_]/gu, '') // remove invalid chars (keep letters/numbers/_)
      .replace(/^_+|_+$/g, '') // remove leading/trailing _
      .replace(/_{2,}/g, '_') // collapse multiple _
      .replaceAll("-", "_")
    }
}

export enum COLUMN_TYPE {
  STRING = 'VARCHAR(MAX)',
  /*MoneyLawGEP - Common Columns Definitions*/
  PRIMARY_KEY = 'INT IDENTITY(1, 1) PRIMARY KEY',
  CREATED_AT = 'DATETIME2 DEFAULT SYSDATETIME()',
  STATUS = "VARCHAR(50)"
}