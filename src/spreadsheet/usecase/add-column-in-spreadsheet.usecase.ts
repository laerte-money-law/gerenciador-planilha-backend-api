import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AddColumnDto } from '../model/dto/add-column.dto';
import { AddColumnResponseDto } from '../model/dto/add-column.response.dto';
import { MetadataService } from '../services/metadata.service';

@Injectable()
export class AddColumnInSpreadsheetUseCase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly metadataService: MetadataService,
  ) {}

  async execute(
    spreadsheetId: string,
    addColumnDto: AddColumnDto,
  ): Promise<AddColumnResponseDto> {
    const columnName = addColumnDto.getColumnName();

    const spreadsheet = await this.metadataService.getMetadata(spreadsheetId);

    const alterSql = `
        IF COL_LENGTH('dbo.${spreadsheet.tableName}', '${columnName}') IS NULL
        BEGIN
            ALTER TABLE dbo.${spreadsheet.tableName} 
            ADD ${columnName} VARCHAR(255) NULL;
       
            SELECT 1 AS ColumnAdded;
        END
        ELSE
        BEGIN
            SELECT 0 AS ColumnAdded;
        END
        `;

    try {
      const result = await this.dataSource.query(alterSql);
      const columnAdded = result?.[0]?.ColumnAdded === 1;

      return {
        wasAdded: columnAdded,
        tableName: spreadsheet.tableName,
        columnName: columnName,
      };

    } catch (err) {
      throw new Error(
        `Failed to add column '${columnName}' on table '${spreadsheet.tableName}': ${err?.message || err}`,
      );
    }
  }
}
