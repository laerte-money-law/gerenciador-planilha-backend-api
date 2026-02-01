import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { InjectRepository } from '@nestjs/typeorm';
import { SpreadsheetMetadata } from './model/spreadsheet.metadata.entity';
import { Role } from 'src/security/role/role.enum';
import { PaginatedResponseDto } from 'src/shared/dto/paginated-response.dto';
import { SpreadsheetListItemDto } from './model/dto/spreadsheet-list-item.dto';

@Injectable()
export class SpreadsheetService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
  ) {}

  async importCsv(
    file: Express.Multer.File,
    userId: number,
    teamId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // PARSE CSV 

      const content = file.buffer.toString('utf-8');

      const records: string[][] = parse(content, {
        skip_empty_lines: true,
      });

      const [rawHeader, ...rows] = records;

      if (!rawHeader || rawHeader.length === 0) {
        throw new Error('CSV sem header');
      }

      const columns = rawHeader.map(this.sanitizeColumn);

      // CREATE TABLE

      const tableName = `spreadsheet_${Date.now()}`;

      const createTableSQL = `
        CREATE TABLE [${tableName}] (
          id INT IDENTITY(1,1) PRIMARY KEY,
          ${columns.map(c => `[${c}] NVARCHAR(MAX)`).join(',')},
          created_by INT NOT NULL,
          last_updated_by INT NOT NULL,
          team_id INT NOT NULL,
          created_at DATETIME2 DEFAULT SYSDATETIME()
        );
      `;

      await queryRunner.query(createTableSQL);

      //INSERT DATA 

      const insertColumns = [
        ...columns,
        'created_by',
        'last_updated_by',
        'team_id',
      ];

      const valuesSQL = rows.map(row => {
        const values = row.map(v =>
          `'${v.replace(/'/g, "''")}'`,
        );
        
        return `(${[
          ...values,
          `'${userId}'`,
          `'${userId}'`,
          `'${teamId}'`,
        ].join(',')})`;
      });

      const insertSQL = `
        INSERT INTO "${tableName}" (${insertColumns.join(',')})
        VALUES ${valuesSQL.join(',')};
      `;

      await queryRunner.query(insertSQL);

      // SAVE METADATA 

      const metadata = this.metadataRepository.create({
        tableName,
        originalFileName: file.originalname,
        teamId,
        createdBy: userId,
      });

      await queryRunner.manager.save(metadata);
      await queryRunner.commitTransaction();

      return {
        id: metadata.id,
        name: metadata.originalFileName,
        rowsImported: rows.length,
      };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
  }

  async getSpreadsheets(role: string, teamId: number, page = 1, limit = 1): Promise<PaginatedResponseDto<SpreadsheetListItemDto>> {
    const skip = (page - 1) * limit;

    let items: SpreadsheetMetadata[];
    let total: number;

  if (role === 'ADMIN') {
    [items, total] = await this.metadataRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  } else {
    [items, total] = await this.metadataRepository.findAndCount({
      where: { teamId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  return {
    data: items.map(item => ({
      id: item.id,
      name: item.originalFileName,
      createdAt: item.createdAt,
    })),
    page,
    limit,
    total,
  };

  }

  private sanitizeColumn(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');
  }
}

  

  /*async exportSpreadsheet(spreadsheetId: number): Promise<string> {
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
*/


