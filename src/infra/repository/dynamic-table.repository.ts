import { Injectable, Logger } from '@nestjs/common';
import { SqlBuilderService } from '../service/sql-builder.service';
import { DataSource } from 'typeorm';
import { InternalConfigAppError } from '../../shared/exceptions/custom/internal-config.error';
import { ERROR_MESSAGES } from '../../shared/exceptions/error-messages.enum';
import { ColumnDto } from '../../spreadsheet/model/dto/column.dto';
import { GetPaginatedData } from '../../spreadsheet/model/dto/get-paginated-data';

@Injectable()
export class DynamicTableRepository {
  private readonly logger = new Logger(DynamicTableRepository.name);

  constructor(
    private readonly sqlBuilderService: SqlBuilderService,
    private readonly dataSource: DataSource,
  ) { }

  async deleteTable(tableName: string): Promise<void> {
    const query = this.sqlBuilderService.DELETE_TABLE(tableName);
    await this.executeQuery(query, `Error while deleting table '${tableName}'`);
    this.logger.log(`Table '${tableName}' was deleted successfully.`);
  }

  async getTableColumns(tableName: string): Promise<string[]> {
    const query = this.sqlBuilderService.GET_TABLE_COLUMNS(tableName);
    const rowResult = await this.executeQuery<any[]>(
      query,
      `Error while fetching columns for table '${tableName}'`,
    );
    return rowResult.map(row => row.COLUMN_NAME);
  }

  async createTable(tableName: string, columns: ColumnDto[]): Promise<void> {
    const query = this.sqlBuilderService.CREATE_TABLE(tableName, columns);
    await this.executeQuery(query, `Error while creating table ${tableName}`);
    this.logger.log(`table '${tableName}' created with success`);
  }

  async insertIntoTable(
    tableName: string,
    columns: string[],
    rowValues: string[][],
  ) {
    const query = this.sqlBuilderService.INSERT_INTO(
      tableName,
      columns,
      rowValues,
    );
    await this.executeQuery(query, `Error while inserting into table ${tableName}`);
    this.logger.log(`insert into table '${tableName}'`);
  }

  async getDataTable(
    tableName: string,
    getPaginatedDataDTO: GetPaginatedData,
  ): Promise<any[]> {
    
    const query = this.sqlBuilderService.GET_PAGINATED_DATA(
      tableName,
      getPaginatedDataDTO,
    );
    return this.executeQuery<any[]>(
      query,
      `Error while fetching paginated data from ${tableName}`,
    );
  }

  async getCount(
    tableName: string,
    getDataDTO: GetPaginatedData,
  ): Promise<number> {
    const query = this.sqlBuilderService.GET_COUNT(tableName, getDataDTO);
    const result = await this.executeQuery<any[]>(
      query,
      `Error while fetching count from ${tableName}`,
    );
    return Number(result[0]?.total ?? 0);
  }

  private async executeQuery<T>(query: string, logMessage: string): Promise<T> {
    try {
      return await this.dataSource.query(query);
    } catch (error) {
      this.logger.error(error);
      this.logger.error(`${logMessage} - Query: ${query}`, error.stack);
      throw new InternalConfigAppError(
        ERROR_MESSAGES.ERROR_EXECUTING_QUERY(query),
      );
    }
  }
}
