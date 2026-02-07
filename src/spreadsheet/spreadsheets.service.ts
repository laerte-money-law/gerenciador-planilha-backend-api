import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { InjectRepository } from '@nestjs/typeorm';
import { SpreadsheetMetadata } from './model/spreadsheet.metadata.entity';
import { Role } from 'src/security/role/role.enum';
import { PaginatedResponseDto } from 'src/shared/dto/paginated-response.dto';
import { SpreadsheetListItemDto } from './model/dto/spreadsheet-list-item.dto';
import { SpreadsheetViewResponseDto } from './model/dto/spreadsheet-view-response.dto';
import { SpreadsheetFiltersDto } from './model/dto/create-spreadsheet-filter.dto';
import { Team } from 'src/team/model/team.entity';

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
      // PARSE CSV 
      const content = file.buffer.toString('utf-8');

      const records: string[][] = parse(content, {
        skip_empty_lines: true,
        delimiter: ";"
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
          status VARCHAR(30),
          created_by INT NOT NULL,
          last_updated_by INT NOT NULL,
          team_id INT NOT NULL,
          created_at DATETIME2 DEFAULT SYSDATETIME()
        );
      `;

      await queryRunner.query(createTableSQL);

      //INSERT DATA IN BATCHES OF 1000

      const insertColumns = [
        ...columns,
        'status',
        'created_by',
        'last_updated_by',
        'team_id',
      ];

      const batchSize = 1000;
      const totalBatches = Math.ceil(rows.length / batchSize);

      for (let i = 0; i < totalBatches; i++) {
        const startIndex = i * batchSize;
        const endIndex = Math.min((i + 1) * batchSize, rows.length);
        const batchRows = rows.slice(startIndex, endIndex);

        const valuesSQL = batchRows.map(row => {
          const values = row.map(v =>
            `'${v.replace(/'/g, "''")}'`,
          );

          return `(${[
            ...values,
            `'IN PROGRESS'`,
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
