import { Injectable, Logger } from '@nestjs/common';
import { SqlBuilderService } from '../service/sql-builder.service';
import { DataSource } from 'typeorm';
import { InternalConfigAppError } from '../../shared/exceptions/custom/internal-config.error';
import { ERROR_MESSAGES } from '../../shared/exceptions/error-messages.enum';
import { ColumnDto } from '../../spreadsheet/model/dto/column.dto';

@Injectable()
export class DynamicTableRepository {
  private readonly logger = new Logger(DynamicTableRepository.name);

  constructor(
    private readonly sqlBuilderService: SqlBuilderService,
    private readonly dataSource: DataSource,
  ) {}

  async deleteTable(tableName: string): Promise<void> {
    const query = this.sqlBuilderService.DELETE_TABLE(tableName);

    try {
      await this.dataSource.query(query);
      this.logger.log(`Table '${tableName}' was deleted successfully.`);
    } catch (error) {
      this.logger.log(`Error while deleting table '${tableName}'`);
      throw new InternalConfigAppError(
        ERROR_MESSAGES.ERROR_EXECUTING_QUERY(query),
      );
    }
  }

  async getTableColumns(tableName: string): Promise<string[]> {
    const query = this.sqlBuilderService.GET_TABLE_COLUMNS(tableName);
    try {
      const rowResult = await this.dataSource.query(query);
      return rowResult.length > 0 ? Object.keys(rowResult[0]) : [];
    } catch (error) {
      this.logger.log(`Error while fetching columns for table '${tableName}'`);
      throw new InternalConfigAppError(
        ERROR_MESSAGES.ERROR_EXECUTING_QUERY(query),
      );
    }
  }

  async createTable(tableName: string, columns: ColumnDto[]): Promise<void> {
    const query = this.sqlBuilderService.CREATE_TABLE(tableName, columns);
    try {
      await this.dataSource.query(query);
      this.logger.log(`table '${tableName}' created with success`);
    } catch (error) {
      this.logger.log(error);
      this.logger.log(`Error while creating table ${tableName}`);
      throw new InternalConfigAppError(
        ERROR_MESSAGES.ERROR_EXECUTING_QUERY(query),
      );
    }
  }

  async insertIntoTable(tableName: string, columns: string[], rowValues: string[][]) {
    const query = this.sqlBuilderService.INSERT_INTO(tableName, columns, rowValues);
    try {
      await this.dataSource.query(query);
      this.logger.log(`insert into table '${tableName}'`);
    } catch (error) {
      this.logger.error(error);
      this.logger.log(`Error while inserting into table ${tableName}`);
      throw new InternalConfigAppError(
        ERROR_MESSAGES.ERROR_EXECUTING_QUERY(query),
      );
    }

  }

}
