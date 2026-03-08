import { Injectable, Logger } from '@nestjs/common';
import { SqlBuilderService } from '../service/sql-builder.service';
import { DataSource } from 'typeorm';
import { InternalConfigAppError } from '../../shared/exceptions/custom/internal-config.error';
import { ERROR_MESSAGES } from '../../shared/exceptions/error-messages.enum';

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
}
