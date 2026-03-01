import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { RowStatus } from '../model/enum/row-status.enum';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SpreadsheetMetadata } from '../model/spreadsheet.metadata.entity';

@Injectable()
export class ImportSpreadsheetUsecase {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
  ) {}

  async execute(
    file: Express.Multer.File,
    userId: number,
    teamId: number,
    clientId: number,
    service: string,
    status: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      // Detect extension and parse accordingly
      const extension = (extname(file.originalname || '') || '').toLowerCase();

      let records: any[] = [];

      if (extension === '.xlsx') {
        // Parse XLSX buffer using xlsx
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error('XLSX sem sheets');
        }
        const sheet = workbook.Sheets[sheetName];
        const arr: any[] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          raw: false,
        });
        records = arr.map((r) =>
          Array.isArray(r)
            ? r.map((c) => (c === null || c === undefined ? '' : String(c)))
            : [],
        );
      } else {
        // Parse CSV: try both ';' and ',' and choose the one that fits header length best
        const content = file.buffer.toString('utf-8');

        const tryParse = (delim: string) => {
          try {
            const parsed: string[][] = parse(content, {
              skip_empty_lines: true,
              delimiter: delim,
            });
            return parsed;
          } catch (e) {
            console.warn(
              `[importCsv] parse with delimiter ${delim} failed:`,
              e,
            );
            return [] as string[][];
          }
        };

        const parsedSemi = tryParse(';');
        const parsedComma = tryParse(',');

        const score = (parsed: string[][]) => {
          if (!parsed || parsed.length === 0) return 0;
          const headerLen = parsed[0].length;
          const rows = parsed.slice(1);
          return rows.filter((r) => Array.isArray(r) && r.length === headerLen)
            .length;
        };

        const scoreSemi = score(parsedSemi);
        const scoreComma = score(parsedComma);

        const chosenParsed = scoreSemi >= scoreComma ? parsedSemi : parsedComma;
        const chosenDelimiter = scoreSemi >= scoreComma ? ';' : ',';

        console.log(
          `[importCsv] delimiter scores -> semicolon: ${scoreSemi}, comma: ${scoreComma}. Chosen: '${chosenDelimiter}'`,
        );

        records = chosenParsed.map((r: any) =>
          Array.isArray(r)
            ? r.map((c: any) =>
                c === null || c === undefined ? '' : String(c),
              )
            : [],
        );
      }

      console.log('[importCsv] records count:', records.length);

      const [rawHeader, ...rowsRaw] = records;

      if (!rawHeader || rawHeader.length === 0) {
        throw new Error('XLSX/CSV sem header');
      }

      // Normalize rows: ensure arrays, trim cell strings and remove completely empty rows
      const rows = rowsRaw
        .map((r) =>
          Array.isArray(r)
            ? r.map((c) =>
                c === null || c === undefined ? '' : String(c).trim(),
              )
            : [],
        )
        .filter((r) => r.some((cell) => cell !== ''));

      const columns = rawHeader.map(this.sanitizeColumn);
      const expectedColumnCount = columns.length;

      // IMPORTANTE: Garantir que cada linha tem exatamente expectedColumnCount colunas
      const normalizedRows = rows.map((row) => {
        const normalized: string[] = [];
        for (let i = 0; i < expectedColumnCount; i++) {
          normalized[i] = row[i] ?? '';
        }
        return normalized;
      });

      console.log('[importCsv] header columns:', columns);
      console.log('[importCsv] expectedColumnCount:', expectedColumnCount);
      console.log(
        '[importCsv] rows count after normalization (non-empty):',
        normalizedRows.length,
      );
      if (normalizedRows.length > 0) {
        console.log(
          '[importCsv] sample row lengths:',
          normalizedRows
            .slice(0, 5)
            .map((r, idx) => ({ idx, len: r.length, sample: r.slice(0, 3) })),
        );
        console.log(
          '[importCsv] verifying all rows have expectedColumnCount columns:',
          normalizedRows.every((r) => r.length === expectedColumnCount),
        );
      }

      // CREATE TABLE (mantido exatamente como antes)

      const tableName = `spreadsheet_${Date.now()}`;

      const createTableSQL = `
        CREATE TABLE [${tableName}] (
          id_ml INT IDENTITY(1,1) PRIMARY KEY,
          ${columns.map((c) => `[${c}] NVARCHAR(MAX)`).join(',')},
          [status_ml] VARCHAR(30),
          [created_by] INT NOT NULL,
          [last_updated_by] INT NOT NULL,
          [team_id] INT NOT NULL,
          [created_at] DATETIME2 DEFAULT SYSDATETIME()
        );
      `;

      console.log(
        '[importCsv] creating table with SQL length:',
        createTableSQL.length,
      );
      await queryRunner.query(createTableSQL);

      //INSERT DATA - 1 linha por vez para garantir alinhamento de colunas e valores

      const insertColumns = [
        ...columns,
        'status_ml',
        'created_by',
        'last_updated_by',
        'team_id',
      ];

      const bracketedColumns = insertColumns.map((c) => `[${c}]`).join(',');

      console.log('[importCsv] insertColumns count:', insertColumns.length);
      console.log('[importCsv] bracketedColumns:', bracketedColumns);

      let totalInserted = 0;

      for (let rowIndex = 0; rowIndex < normalizedRows.length; rowIndex++) {
        const row = normalizedRows[rowIndex];

        // Construir valores da linha
        const values: string[] = [];

        // Adicionar valores das colunas do arquivo
        for (let c = 0; c < expectedColumnCount; c++) {
          const cellValue = row[c] ?? '';
          // Escapar aspas simples: ' -> ''
          const escaped = String(cellValue).replace(/'/g, "''");
          values.push(`'${escaped}'`);
        }

        // Adicionar valores das colunas extras
        values.push(`'${RowStatus.IN_PROGRESS}'`); // status
        values.push(`${userId}`); // created_by
        values.push(`${userId}`); // last_updated_by
        values.push(`${teamId}`); // team_id

        // Verificar que temos o mesmo número de colunas e valores
        if (values.length !== insertColumns.length) {
          console.error(
            `[importCsv] row ${rowIndex} mismatch: ${insertColumns.length} columns but ${values.length} values`,
          );
          throw new Error(
            `Row ${rowIndex}: column count (${insertColumns.length}) does not match value count (${values.length})`,
          );
        }

        // Construir e executar INSERT
        const insertSQL = `INSERT INTO [${tableName}] (${bracketedColumns}) VALUES (${values.join(',')});`;

        try {
          await queryRunner.query(insertSQL);
          totalInserted += 1;

          // Log a cada 100 linhas
          if ((rowIndex + 1) % 100 === 0) {
            console.log(
              `[importCsv] inserted ${rowIndex + 1}/${normalizedRows.length} rows`,
            );
          }
        } catch (error) {
          console.error(`[importCsv] error inserting row ${rowIndex}:`, error);
          console.error(`[importCsv] row data sample:`, row.slice(0, 5));
          console.error(
            `[importCsv] values count:`,
            values.length,
            'columns count:',
            insertColumns.length,
          );
          throw error;
        }
      }

      console.log(`[importCsv] completed: inserted ${totalInserted} rows`);
      console.log(`IDS: CLIENT ID ${clientId}; TEAM ID ${teamId}; USER ID ${userId}`);
      // SAVE METADATA
      const metadata = this.metadataRepository.create({
        tableName,
        originalFileName: file.originalname,
        team: { id: teamId },
        client: { id: clientId },
        createdBy: userId,
        service,
        status,
      });

      await queryRunner.manager.save(metadata);

      return {
        id: metadata.id,
        name: metadata.originalFileName,
        rowsImported: totalInserted,
      };
    } catch (error) {
      console.error('[importCsv] erro durante importação:', error);
      throw error;
    }
  }

  private sanitizeColumn(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');
  }
}