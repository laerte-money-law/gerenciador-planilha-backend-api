import { Injectable } from '@nestjs/common';
import { ColumnDto } from '../../spreadsheet/model/dto/column.dto';
import { GetPaginatedData } from '../../spreadsheet/model/dto/get-paginated-data';
import { ML_COLUMN_ID, ML_COLUMN_STATUS } from '../../spreadsheet/constants';
import { ROW_STATUS } from 'src/spreadsheet/model/enum/row-status.enum';

@Injectable()
export class SqlBuilderService {
  DELETE_TABLE(tableName: string): string {
    return `DROP TABLE IF EXISTS dbo.${tableName};`;
  }

  GET_TABLE_COLUMNS(tableName: string): string {
    return `SELECT TOP 1 * FROM dbo.[${tableName}];`;
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
    const insertRows = this.buildSqlValueTuples(values, columns.length).join(
      ', ',
    );
    return `INSERT INTO dbo.[${tableName}] (${columnsSqlQuery}) VALUES ${insertRows}`;
  }

  GET_PAGINATED_DATA(
    tableName: string,
    getPaginatedDataDTO: GetPaginatedData,
  ): string {
    let query = `SELECT * FROM dbo.[${tableName}] `;

    const { limit, page } = getPaginatedDataDTO;
    const finalOffset = (page - 1) * limit;

    query += this.buildWhereCondition(getPaginatedDataDTO);

     query += `
      ORDER BY 
        CASE 
        WHEN [${ML_COLUMN_STATUS}] IS NULL OR [${ML_COLUMN_STATUS}] = '' THEN 1
        WHEN [${ML_COLUMN_STATUS}] = 'EM ANÁLISE' THEN 2
        WHEN [${ML_COLUMN_STATUS}] = 'COM PENDÊNCIA' THEN 3
        ELSE 4
      END,
      [${ML_COLUMN_ID}] ASC
    `;

    query += ` OFFSET ${finalOffset} ROWS FETCH NEXT ${limit} ROWS ONLY;`;

    return query;
  }

  private buildWhereCondition(getDataDTO: GetPaginatedData) {
    const { status, notStatus, search, } = getDataDTO
    const conditions: string[] = [];

    if (getDataDTO.isInitialView) {
    conditions.push(`
      (
        [${ML_COLUMN_STATUS}] = '${ROW_STATUS.EM_ANALISE}'
        OR [${ML_COLUMN_STATUS}] IS NULL
        OR [${ML_COLUMN_STATUS}] = ''
      )
    `);
  } else if (status && status.length > 0) {
    const statusList = status.map(s => `'${s}'`).join(', ');
    conditions.push(`[${ML_COLUMN_STATUS}] IN (${statusList})`);
  }

    if (notStatus) {
      conditions.push(`[${ML_COLUMN_STATUS}] <> '${notStatus}'`);
    }

    if (search) {
      // Logic for search can be added here
      // conditions.push(`processo LIKE '%${search}%'`);
    }

    if (conditions.length > 0) {
      return ` WHERE ${conditions.join(' AND ')}`;
    }
    return "";
  }

  GET_COUNT(tableName: string, getDataDTO: GetPaginatedData): string {
    let query = `SELECT COUNT(1) as total FROM dbo.[${tableName}] `;
    query += this.buildWhereCondition(getDataDTO);
    return query;
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
