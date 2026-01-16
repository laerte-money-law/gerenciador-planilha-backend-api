import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ColumnReadRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getNextOrderIndex(spreadsheetId: number): Promise<number> {
    const result = await this.dataSource.query(
      `
      SELECT ISNULL(MAX(order_index), 0) + 1 AS next_order
      FROM column
      WHERE spreadsheet_id = ?
      `,
       [ spreadsheetId ],
    );

    return result[0].next_order;
  }
}
