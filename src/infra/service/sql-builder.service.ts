import { Injectable } from '@nestjs/common';
import { ColumnDto } from '../../spreadsheet/model/dto/column.dto';

@Injectable()
export class SqlBuilderService {
  DELETE_TABLE(tableName: string): string {
    return `DROP TABLE IF EXISTS dbo.${tableName};`;
  }

  GET_TABLE_COLUMNS(tableName: string): string {
    return `SELECT * FROM dbo.${tableName} LIMIT 1;`;
  }

  CREATE_TABLE(tableName: string, columns: ColumnDto[]): string {
    // Todo: validate column name duplication? add normalization

    const columnDefinitions = columns
      .map((column) => column.getColumnDefinitionSQL())
      .join(', ');

    return `CREATE TABLE dbo.[${tableName}] (${columnDefinitions})`;
  }

  INSERT_INTO(tableName: string, columns: string[], values: string[][]) {
    const columnsSqlQuery = columns.join(', ');
    const insertRows = this.buildSqlValueTuples(values, columns.length).join(', ');
    return `INSERT INTO dbo.[${tableName}] (${columnsSqlQuery}) VALUES ${insertRows}`;
  }

  private buildSqlValueTuples(
    valueRows: string[][],
    columnCount: number,
  ): string[] {
    return valueRows.map((row) => {
      const paddedRow = [...row];

      while (paddedRow.length < columnCount) {
        paddedRow.push('');
      }

      const values = paddedRow.map((cell) => {
        const normalized = String(cell ?? '')
          .trim()
          .replace(/'/g, "''");

        return `'${normalized}'`;
      });

      return `(${values.join(',')})`;
    });
  }
}
