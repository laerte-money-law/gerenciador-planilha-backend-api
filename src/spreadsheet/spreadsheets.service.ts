import { Injectable } from '@nestjs/common';
import { CellWriteRepository } from './repository/cell/cell.write.repository';
import { SpreadsheetReadRepository } from './repository/spreadsheet.read.repository';
import { ColumnWriteRepository } from './repository/cell/column.write.repository';
import { ColumnReadRepository } from './repository/cell/column.read.repository';
import { DataSource } from 'typeorm';
import { parse } from 'csv-parse/sync';

type ExportRow = {
  row_id: number;
  row_order: number;
  column_id: number;
  column_title: string;
  column_order: number;
  value: string | null;
};


@Injectable()
export class SpreadsheetService {
  constructor(
    private readonly cellWriteRepository: CellWriteRepository,
    private readonly spreadsheetReadRepository: SpreadsheetReadRepository,
    private readonly columnWriteRepository: ColumnWriteRepository,
    private readonly columnReadRepository: ColumnReadRepository,
    private readonly dataSource: DataSource
  ) {}

  async updateCell(params: {
    rowId: number;
    columnId: number;
    value: string | null;
    userId: number;
  }): Promise<void> {
    await this.cellWriteRepository.upsert(params);
  }

  async getRows(params: {
    spreadsheetId: number;
    status: string;
    page: number;
    pageSize: number;
  }) {
    const offset = (params.page - 1) * params.pageSize;

    const rows = await this.spreadsheetReadRepository.getPagedRows({
      spreadsheetId: params.spreadsheetId,
      status: params.status,
      offset,
      limit: params.pageSize,
    });

    const grouped = new Map<number, any>();

    for (const item of rows) {
      if (!grouped.has(item.row_id)) {
        grouped.set(item.row_id, {
          rowId: item.row_id,
          status: item.row_status,
          cells: [],
        });
      }

      grouped.get(item.row_id).cells.push({
        columnId: item.column_id,
        columnTitle: item.column_title,
        value: item.value,
      });
    }

    return Array.from(grouped.values());
  }

  async createColumn(params: {
    spreadsheetId: number;
    title: string;
  }) {
    const orderIndex =
      await this.columnReadRepository.getNextOrderIndex(params.spreadsheetId);

    return this.columnWriteRepository.create({
      spreadsheetId: params.spreadsheetId,
      title: params.title,
      orderIndex,
    });
  }

  async importCsv(file: Express.Multer.File) {
    const content = file.buffer.toString('utf-8');

    const records: string[][] = parse(content, {
      skip_empty_lines: true,
    });

    const [header, ...rows] = records;

    return this.dataSource.transaction(async (manager) => {
      // cria spreadsheet
      const spreadsheet = await manager.insert('spreadsheet', {
        name: file.originalname,
        created_by: 1,
        team_id: 1,
        created_at: new Date(),
      });

      const spreadsheetId = spreadsheet.identifiers[0].id;

      // cria colunas
      const columns: number[] = [];
      for (let i = 0; i < header.length; i++) {
        const result = await manager.insert('column', {
          spreadsheet_id: spreadsheetId,
          title: header[i],
          order_index: i + 1,
        });

        columns.push(result.identifiers[0].id);
      }

      // 3️cria linhas + células
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const rowResult = await manager.insert('row', {
          spreadsheet_id: spreadsheetId,
          status: 'IN_PROGRESS',
          order_index: rowIndex + 1,
        });

        const rowId = rowResult.identifiers[0].id;

        for (let colIndex = 0; colIndex < columns.length; colIndex++) {
          const value = rows[rowIndex][colIndex];

          if (value !== undefined && value !== '') {
            await manager.insert('cell', {
              row_id: rowId,
              column_id: columns[colIndex],
              value,
              last_edited_by: 1,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        }
      }

      return { spreadsheetId };
    });
  }

  async exportSpreadsheet(spreadsheetId: number): Promise<string> {
    const rows = await this.spreadsheetReadRepository.getSpreadsheetForExport(
      spreadsheetId,
    ) as ExportRow[];

    if (rows.length === 0) {
      return '';
    }

    const columns: string[] = Array.from(
      new Map(
        rows.map((r) => [r.column_id, r.column_title]),
      ).values(),
    );

    // Agrupar linhas
    const grouped = new Map<number, Record<string, string>>();

    for (const r of rows) {
      if (!grouped.has(r.row_id)) {
        grouped.set(r.row_id, {});
      }

      grouped.get(r.row_id)![r.column_title] = r.value ?? '';
    }

    // Montar CSV
    const header = columns.join(',');
    const lines: string[] = [];

    for (const row of grouped.values()) {
      const line = columns
        .map((col) => row[col] ?? '')
        .join(',');
      lines.push(line);
    }

    return [header, ...lines].join('\n');
  }

}

