import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SpreadsheetMetadata } from '../model/spreadsheet.metadata.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UpdateSpreadsheetRowUsecase {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
  ) {}

  async execute(
    spreadsheetId: string,
    rowId: number,
    updateData: Record<string, string>,
  ) {
    const spreadsheet = await this.metadataRepository.findOne({
      where: { id: spreadsheetId },
    });

    if (!spreadsheet) {
      throw new Error('Spreadsheet not found');
    }

    const tableName = spreadsheet.tableName;
    if (!tableName) {
      throw new Error('Spreadsheet tableName is not defined');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('No fields to update provided');
    }

    if (!rowId) {
      throw new Error('rowId is required');
    }

    const setClause: string[] = [];
    const params: any[] = [];

    let index = 0;

    Object.entries(updateData).forEach(([key, value]) => {
      setClause.push(`[${key}] = @${index}`);
      params.push(value);
      index++;
    });

    const updateSql = `
      UPDATE [${tableName}]
      SET ${setClause.join(', ')}
      WHERE id = @${index}
    `;

    params.push(rowId);

    console.log(updateSql);
    console.log(params);

    try {
      await this.dataSource.query(updateSql, params);

      return {
        updated: true,
        spreadsheetId,
        rowId,
        message: `Row ${rowId} updated successfully in spreadsheet ${spreadsheetId}`,
      };
    } catch (err) {
      throw new Error(
        `Failed to update row ${rowId} in spreadsheet ${spreadsheetId}: ${err?.message || err}`,
      );
    }
  }
}
