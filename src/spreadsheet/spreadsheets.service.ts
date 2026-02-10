import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { InjectRepository } from '@nestjs/typeorm';
import { SpreadsheetMetadata } from './model/spreadsheet.metadata.entity';
import { Role } from 'src/security/role/role.enum';
import { PaginatedResponseDto } from 'src/shared/dto/paginated-response.dto';
import { SpreadsheetListItemDto } from './model/dto/spreadsheet-list-item.dto';
import { SpreadsheetViewResponseDto } from './model/dto/spreadsheet-view-response.dto';
import { SpreadsheetFiltersDto } from './model/dto/create-spreadsheet-filter.dto';
import * as XLSX from 'xlsx';
import { extname } from 'path';

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
    service: string,
    status: string
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // PARSE CSV or XLSX (strategy based on extension)
      const extension = (extname(file.originalname || '') || '').toLowerCase();

      let records: string[][] = [];

      if (extension === '.xlsx') {
        // Parse XLSX buffer using xlsx
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error('XLSX sem sheets');
        }
        const sheet = workbook.Sheets[sheetName];
        const arr: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
        records = arr.map((r) =>
          Array.isArray(r)
            ? r.map((c) => (c === null || c === undefined ? '' : String(c)))
            : [],
        );
      } else {
        // Fallback to CSV parse (keep existing behavior)
        const content = file.buffer.toString('utf-8');

        // Try parsing with both delimiters and pick the one that yields most rows matching header length
        const tryParse = (delim: string) => {
          try {
            const parsed: string[][] = parse(content, { skip_empty_lines: true, delimiter: delim });
            return parsed;
          } catch (e) {
            console.warn(`[importCsv] parse with delimiter ${delim} failed:`, e);
            return [] as string[][];
          }
        };

        const parsedSemi = tryParse(';');
        const parsedComma = tryParse(',');

        const score = (parsed: string[][]) => {
          if (!parsed || parsed.length === 0) return 0;
          const headerLen = parsed[0].length;
          const rows = parsed.slice(1);
          const matches = rows.filter(r => Array.isArray(r) && r.length === headerLen).length;
          return matches;
        };

        const scoreSemi = score(parsedSemi);
        const scoreComma = score(parsedComma);

        const chosenParsed = scoreSemi >= scoreComma ? parsedSemi : parsedComma;
        const chosenDelimiter = scoreSemi >= scoreComma ? ';' : ',';

        console.log(`[importCsv] delimiter scores -> semicolon: ${scoreSemi}, comma: ${scoreComma}. Chosen: '${chosenDelimiter}'`);

        records = chosenParsed;
      }

      console.log('[importCsv] records count:', records.length);

      const [rawHeader, ...rowsRaw] = records;

      if (!rawHeader || rawHeader.length === 0) {
        throw new Error('CSV sem header');
      }

      // Normalize rows: ensure arrays, trim cell strings and remove completely empty rows
      const rows = rowsRaw
        .map(r => Array.isArray(r) ? r.map(c => (c === null || c === undefined ? '' : String(c).trim())) : [])
        .filter(r => r.some(cell => cell !== ''));

      const columns = rawHeader.map(this.sanitizeColumn);
      const expectedColumnCount = columns.length;

      console.log('[importCsv] header columns:', columns);
      console.log('[importCsv] expectedColumnCount:', expectedColumnCount);
      console.log('[importCsv] rows count after normalization (non-empty):', rows.length);
      if (rows.length > 0) {
        console.log('[importCsv] sample row lengths:', rows.slice(0, 5).map((r, idx) => ({idx, len: r.length, sample: r.slice(0,3)})));
      }

      // CREATE TABLE

      const tableName = `spreadsheet_${Date.now()}`;

      const createTableSQL = `
        CREATE TABLE [${tableName}] (
          id INT IDENTITY(1,1) PRIMARY KEY,
          ${columns.map(c => `[${c}] NVARCHAR(MAX)`).join(',')},
          [status] VARCHAR(30),
          [created_by] INT NOT NULL,
          [last_updated_by] INT NOT NULL,
          [team_id] INT NOT NULL,
          [created_at] DATETIME2 DEFAULT SYSDATETIME()
        );
      `;

      console.log('[importCsv] creating table with SQL length:', createTableSQL.length);
      await queryRunner.query(createTableSQL);

      //INSERT DATA IN BATCHES OF 1000

      const insertColumns = [
        ...columns,
        'status',
        'created_by',
        'last_updated_by',
        'team_id',
      ];

      const bracketedColumns = insertColumns.map(c => `[${c}]`).join(',');
      const batchSize = 1000;
      const totalBatches = Math.ceil(rows.length / batchSize);
      const rowStatus = (status ?? 'IN PROGRESS').replace(/'/g, "''");

      console.log('[importCsv] totalBatches:', totalBatches);

      let cumulativeInserted = 0;

      for (let i = 0; i < totalBatches; i++) {
        const startIndex = i * batchSize;
        const endIndex = Math.min((i + 1) * batchSize, rows.length);
        const batchRows = rows.slice(startIndex, endIndex);

        const batchObjects = batchRows.map(row => {
          const obj: Record<string, any> = {};
          for (let c = 0; c < expectedColumnCount; c++) {
            obj[columns[c]] = row[c] ?? '';
          }
          obj['status'] = status ?? 'IN PROGRESS';
          obj['created_by'] = userId;
          obj['last_updated_by'] = userId;
          obj['team_id'] = teamId;
          return obj;
        });

        console.log(`[importCsv] executing batch ${i} parameterized insert, rows: ${batchRows.length}`);

        try {
          // Use parameterized batch insert via TypeORM QueryBuilder
          await queryRunner.manager.createQueryBuilder()
            .insert()
            .into(tableName)
            .values(batchObjects)
            .execute();
        } catch (batchError) {
          console.error(`[importCsv] batch insert failed for batch ${i}:`, batchError);
          // try per-row insert to identify problematic row
          for (let rIndex = 0; rIndex < batchRows.length; rIndex++) {
            const row = batchRows[rIndex];
            const obj: Record<string, any> = {};
            for (let c = 0; c < expectedColumnCount; c++) {
              obj[columns[c]] = row[c] ?? '';
            }
            obj['status'] = status ?? 'IN PROGRESS';
            obj['created_by'] = userId;
            obj['last_updated_by'] = userId;
            obj['team_id'] = teamId;

            try {
              // insert single row via query builder (parameterized)
              await queryRunner.manager.createQueryBuilder()
                .insert()
                .into(tableName)
                .values([obj])
                .execute();
              cumulativeInserted += 1;
            } catch (singleError) {
              console.error(`[importCsv] failed inserting single row at batch ${i} idx ${rIndex}:`, singleError, 'rowSample:', row.slice(0,5));
              // continue attempting remaining rows
            }
          }
          // Continue to next batch after per-row attempts
          continue;
        }

        // Check how many rows are in the table after this batch (diagnostic)
        try {
          const countRes: any = await queryRunner.query(`SELECT COUNT(1) as cnt FROM [${tableName}]`);
          const cnt = Array.isArray(countRes)
            ? (countRes[0] && (countRes[0].cnt ?? countRes[0][''] ?? Object.values(countRes[0])[0]))
            : (countRes && countRes.cnt) || countRes;
          console.log(`[importCsv] after batch ${i} table row count:`, cnt);

          // If count did not increase as expected, fallback to per-row inserts for diagnostics
          if (Number(cnt) < cumulativeInserted + batchRows.length) {
            console.warn(`[importCsv] batch ${i} insert count mismatch (expected +${batchRows.length}). Falling back to per-row inserts for this batch.`);
            for (let rIndex = 0; rIndex < batchRows.length; rIndex++) {
              const row = batchRows[rIndex];
              const obj: Record<string, any> = {};
              for (let c = 0; c < expectedColumnCount; c++) {
                obj[columns[c]] = row[c] ?? '';
              }
              obj['status'] = status ?? 'IN PROGRESS';
              obj['created_by'] = userId;
              obj['last_updated_by'] = userId;
              obj['team_id'] = teamId;

              try {
                await queryRunner.manager.createQueryBuilder()
                  .insert()
                  .into(tableName)
                  .values([obj])
                  .execute();
                cumulativeInserted += 1;
              } catch (singleError) {
                console.error(`[importCsv] failed inserting single row at batch ${i} idx ${rIndex}:`, singleError, 'rowSample:', row.slice(0,5));
              }
            }
          } else {
            cumulativeInserted += batchRows.length;
          }
        } catch (countErr) {
          console.warn(`[importCsv] could not fetch count after batch ${i}:`, countErr);
        }
      }

      // SAVE METADATA 
      const metadata = this.metadataRepository.create({
        tableName,
        originalFileName: file.originalname,
        team: { id: teamId },
        createdBy: userId,
        service,
        status
      });

      await queryRunner.manager.save(metadata);
      await queryRunner.commitTransaction();

      return {
        id: metadata.id,
        name: metadata.originalFileName,
        rowsImported: rows.length,
      };
    } catch (error) {
      console.error('DEU UM PUTA ERRO AQUI', error);

      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getSpreadsheets(
    role: Role,
    teamId: number,
    page = 1,
    limit = 15,
  ): Promise<PaginatedResponseDto<SpreadsheetListItemDto>> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.metadataRepository.findAndCount({
      where:
        role === Role.ADMIN
          ? {}
          : { team: { id: teamId } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: {
        team: true,
      },
    });

    return {
      data: items.map(item => ({
        id: item.id,
        name: item.originalFileName,
        team: item.team,
        service: item.service,
        status: item.status,
        createdAt: item.createdAt,
      })),
      page,
      limit,
      total,
    };
  }

  async getSpreadsheetByIdPaginated(
    spreadsheetId: string,
    role: string,
    teamId: number,
    filters: SpreadsheetFiltersDto,
  ): Promise<SpreadsheetViewResponseDto> {

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 15;
    const offset = (page - 1) * limit;

    const metadata = await this.metadataRepository.findOne({
      where:
        role === 'ADMIN'
          ? { id: spreadsheetId }
          : { id: spreadsheetId, team: {id: teamId} },
    });

    if (!metadata) {
      throw new Error('Planilha não encontrada');
    }

    const tableName = metadata.tableName;

    const baseQb = this.dataSource
      .createQueryBuilder()
      .from(tableName, 't');

    if (filters.status) {
      baseQb.andWhere('t.status = :status', {
        status: filters.status,
      });
    }

    if (filters.search) {
      baseQb.andWhere('t.processo LIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    const countResult = await baseQb
      .clone()
      .select('COUNT(1)', 'total')
      .getRawOne<{ total: number }>();

    const total = Number(countResult?.total ?? 0);

    const rows = await baseQb
      .clone()
      .select('*')
      .orderBy('t.id', 'ASC')
      .offset(offset)
      .limit(limit)
      .getRawMany();

    
    const columns =
      rows.length > 0
        ? Object.keys(rows[0]).filter(
            col =>
              ![
                'created_by',
                'last_updated_by',
                'team_id',
                'created_at',
              ].includes(col),
          )
        : [];

    return {
      id: metadata.id,
      name: metadata.originalFileName,
      columns,
      rows,
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
