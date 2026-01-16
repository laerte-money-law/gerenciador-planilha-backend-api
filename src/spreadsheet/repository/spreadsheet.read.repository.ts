import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SpreadsheetReadRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getPagedRows(params: {
    spreadsheetId: number;
    status: string;
    offset: number;
    limit: number;
  }) {
    return this.dataSource.query(
      `
      ;WITH paged_rows AS (
        SELECT id
        FROM [row]
        WHERE spreadsheet_id = @0
          AND status = @1
        ORDER BY order_index
        OFFSET @2 ROWS FETCH NEXT @3 ROWS ONLY
      )
      SELECT
        r.id            AS row_id,
        r.status        AS row_status,
        r.order_index   AS row_order,

        c.id            AS column_id,
        c.title         AS column_title,
        c.order_index   AS column_order,

        cell.value
      FROM paged_rows pr
      JOIN [row] r ON r.id = pr.id
      JOIN cell cell ON cell.row_id = r.id
      JOIN [column] c ON c.id = cell.column_id
      WHERE c.spreadsheet_id = @4
      ORDER BY r.order_index, c.order_index
      `,
      [
        params.spreadsheetId, 
        params.status,        
        params.offset,        
        params.limit,        
        params.spreadsheetId 
      ],
    );

  }

  async getSpreadsheetForExport(spreadsheetId: number) {
    return this.dataSource.query(
      `
      SELECT
        r.id          AS row_id,
        r.order_index AS row_order,

        c.id          AS column_id,
        c.title       AS column_title,
        c.order_index AS column_order,

        cell.value
      FROM [row] r
      JOIN cell cell ON cell.row_id = r.id
      JOIN [column] c ON c.id = cell.column_id
      WHERE r.spreadsheet_id = @0
      ORDER BY r.order_index, c.order_index
      `,
      [spreadsheetId],
    );
  }

}
