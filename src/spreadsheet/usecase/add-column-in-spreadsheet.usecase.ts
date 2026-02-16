import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SpreadsheetMetadata } from '../model/spreadsheet.metadata.entity';
import { AddColumnDto } from '../model/dto/add-column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AddColumnResponseDto } from '../model/dto/add-column.response.dto';

@Injectable()
export class AddColumnInSpreadsheetUseCase {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
  ) {}

  async execute(
    spreadsheetId: string,
    addColumnDto: AddColumnDto,
  ): Promise<AddColumnResponseDto> {
    const columnName = addColumnDto.getColumnName();

    const spreadsheet = await this.metadataRepository.findOne({
      where: { id: spreadsheetId },
    });

    if (!spreadsheet) {
      throw new Error('Spreadsheet not found');
    }

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
