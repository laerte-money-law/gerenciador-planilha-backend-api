import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DeleteColumnDto } from '../model/dto/delete-column.dto';
import { MetadataService } from '../services/metadata.service';

@Injectable()
export class DeleteColumnInSpreadsheet {
  constructor(
    private readonly dataSource: DataSource,
    private readonly metadataService: MetadataService,
  ) {}

  async execute(spreadsheetId: string, deleteColumnDto: DeleteColumnDto) {
    const columnName = deleteColumnDto.columnName;

    const spreadsheet = await this.metadataService.getMetadata(spreadsheetId);

    const tableName = spreadsheet.tableName;
    if (!tableName) {
      throw new Error('Spreadsheet tableName is not defined');
    }

    const trimmedColumn = (columnName || '').trim();
    if (!trimmedColumn) {
      throw new Error('columnName is required');
    }

    // Minimal escaping for string literals used in the SQL text
    const columnForQuery = trimmedColumn.replace(/'/g, "''");
    const tableForQuery = tableName.replace(/'/g, "''");

    // Use simple bracket quoting for identifiers
    const escapedTable = `[${tableName}]`;
    const escapedColumn = `[${trimmedColumn}]`;

    // SQL Server: drop column only if it exists
    const dropSql = `IF EXISTS (
      SELECT 1 FROM sys.columns
      WHERE Name = N'${columnForQuery}'
        AND Object_ID = Object_ID(N'${tableForQuery}')
    )
    BEGIN
      ALTER TABLE ${escapedTable} DROP COLUMN ${escapedColumn};
    END`;

    try {
      await this.dataSource.query(dropSql);
      return {
        deleted: true,
        table: tableName,
        column: trimmedColumn,
        message: `Column '${trimmedColumn}' deleted successfully from table '${tableName}'`,
      };
    } catch (err) {
      throw new Error(
        `Failed to delete column '${trimmedColumn}' from table '${tableName}': ${err?.message || err}`,
      );
    }
  }
}

