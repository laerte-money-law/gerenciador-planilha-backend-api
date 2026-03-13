import { DynamicTableRepository } from '../../infra/repository/dynamic-table.repository';
import { SpreadsheetFiltersDto } from '../model/dto/create-spreadsheet-filter.dto';
import { SpreadsheetViewResponseDto } from '../model/dto/spreadsheet-view-response.dto';
import { MetadataService } from '../services/metadata.service';
import { GetPaginatedData } from '../model/dto/get-paginated-data';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetSpreadsheetByIdUseCase {
  constructor(
    private readonly metadataService: MetadataService,
    private readonly dynamicTableRepository: DynamicTableRepository,
  ) { }

  async execute(
    spreadsheetId: string,
    filters: SpreadsheetFiltersDto,
  ): Promise<SpreadsheetViewResponseDto> {

    const metadata = await this.metadataService.getMetadata(spreadsheetId);

    const tableName = metadata.tableName;

    const getDataDTO = new GetPaginatedData(filters)

    const [rows, total] = await Promise.all([
      this.dynamicTableRepository.getDataTable(tableName, getDataDTO),
      this.dynamicTableRepository.getCount(tableName, getDataDTO),
    ]);

    //todo: eh necessario fazer a remocao das colunas default da MONEYLAW
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
      page: filters.page,
      limit: filters.limit,
      total,
    };
  }
}
