import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SpreadsheetMetadata } from './model/spreadsheet.metadata.entity';
import { Role } from 'src/security/role/role.enum';
import { PaginatedResponseDto } from 'src/shared/dto/paginated-response.dto';
import { SpreadsheetListItemDto } from './model/dto/spreadsheet-list-item.dto';
import { SpreadsheetViewResponseDto } from './model/dto/spreadsheet-view-response.dto';
import { SpreadsheetFiltersDto } from './model/dto/create-spreadsheet-filter.dto';
import { ImportSpreadsheetUsecase } from './usecase/import-spreadsheet.usecase';
import { AddColumnInSpreadsheetUseCase } from './usecase/add-column-in-spreadsheet.usecase';
import { AddColumnDto } from './model/dto/add-column.dto';
import { AddColumnResponseDto } from './model/dto/add-column.response.dto';
import { DeleteColumnInSpreadsheet } from './usecase/delete-column-in-spreadsheet';
import { DeleteColumnDto, DeleteColumnResponseDto } from './model/dto/delete-column.dto';
import { GetSpreadsheetColumnsResponseDto } from './model/dto/get-spreadsheet-columns.dto';
import { UpdateSpreadsheetRowUsecase } from './usecase/update-spreadsheet-row.usecase';
import { UpdateSpreadsheetRowResponseDto } from './model/dto/update-spreadsheet-row.dto';
import { ExportSpreadsheetUsecase } from './usecase/export-spreadsheet.usecase';

@Injectable()
export class SpreadsheetService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
    private readonly importSpreadsheetUseCase: ImportSpreadsheetUsecase,
    private readonly addColumnInSpreadsheet: AddColumnInSpreadsheetUseCase,
    private readonly deleteColumnInSpreadsheet: DeleteColumnInSpreadsheet,
    private readonly updateSpreadsheetRowUsecase: UpdateSpreadsheetRowUsecase,
    private readonly exportSpreadsheetUsecase: ExportSpreadsheetUsecase
  ) {}

  async importSpreadsheet(
    file: Express.Multer.File,
    userId: number,
    teamId: number,
    service: string,
    status: string,
  ) {
    return this.importSpreadsheetUseCase.execute(
      file,
      userId,
      teamId,
      service,
      status,
    );
  }

  async getSpreadsheets(
    role: Role,
    teamId: number,
    page = 1,
    limit = 15,
  ): Promise<PaginatedResponseDto<SpreadsheetListItemDto>> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.metadataRepository.findAndCount({
      where: role === Role.ADMIN ? {} : { team: { id: teamId } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: {
        team: true,
      },
    });

    return {
      data: items.map((item) => ({
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
          : { id: spreadsheetId, team: { id: teamId } },
    });

    if (!metadata) {
      throw new Error('Planilha não encontrada');
    }

    const tableName = metadata.tableName;

    const baseQb = this.dataSource.createQueryBuilder().from(tableName, 't');

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
            (col) =>
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

  async exportSpreadsheet(
    spreadsheetId: string,
    role: string,
    teamId: number
  ){
    return await this.exportSpreadsheetUsecase.execute(spreadsheetId,role,teamId);
  }

  async addColumnToSpreadsheet(
    spreadsheetId: string,
    columnName: AddColumnDto,
  ): Promise<AddColumnResponseDto> {
    return await this.addColumnInSpreadsheet.execute(spreadsheetId, columnName);
  }

  async deleteColumnFromSpreadsheet(
    spreadsheetId: string,
    deleteColumnDto: DeleteColumnDto,
  ): Promise<DeleteColumnResponseDto> {
    return await this.deleteColumnInSpreadsheet.execute(
      spreadsheetId,
      deleteColumnDto,
    );
  }

  async getSpreadsheetColumns(
    spreadsheetId: string,
    role: string,
    teamId: number,
  ): Promise<GetSpreadsheetColumnsResponseDto> {
    const metadata = await this.metadataRepository.findOne({
      where:
        role === 'ADMIN'
          ? { id: spreadsheetId }
          : { id: spreadsheetId, team: { id: teamId } },
    });

    if (!metadata) {
      throw new Error('Planilha não encontrada');
    }

    const tableName = metadata.tableName;

    // Query one row to get column names
    const rows = await this.dataSource
      .createQueryBuilder()
      .from(tableName, 't')
      .select('*')
      .limit(1)
      .getRawMany();

    const columns =
      rows.length > 0
        ? Object.keys(rows[0]).filter(
            (col) =>
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
    };
  }

  async updateSpreadsheetRow(
    spreadsheetId: string,
    rowId: number,
    updateData: Record<string, any>,
  ): Promise<UpdateSpreadsheetRowResponseDto> {
    return await this.updateSpreadsheetRowUsecase.execute(
      spreadsheetId,
      rowId,
      updateData,
    );
  }
}
