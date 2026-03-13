import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MetadataService } from '../services/metadata.service';
import { ML_COLUMN_ID } from '../constants';

@Injectable()
export class UpdateSpreadsheetRowUsecase {
  constructor(
    private readonly dataSource: DataSource,
    private readonly metadataService: MetadataService,
  ) { }

  async execute(
    spreadsheetId: string,
    rowId: number,
    updateData: Record<string, string>,
  ) {
    const spreadsheet = await this.metadataService.getMetadata(spreadsheetId);

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

    //removing id column from updateData
    delete updateData["ML_ID"]

    Object.entries(updateData).forEach(([key, value]) => {
      setClause.push(`[${key}] = @${index}`);
      params.push(value);
      index++;
    });

    const updateSql = `
      UPDATE [${tableName}]
      SET ${setClause.join(', ')}
      WHERE ${ML_COLUMN_ID} = @${index}
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
