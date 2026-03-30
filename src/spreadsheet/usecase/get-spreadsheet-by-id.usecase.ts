import { DynamicTableRepository } from '../../infra/repository/dynamic-table.repository';
import { SpreadsheetFiltersDto } from '../model/dto/create-spreadsheet-filter.dto';
import { SpreadsheetViewResponseDto } from '../model/dto/spreadsheet-view-response.dto';
import { MetadataService } from '../services/metadata.service';
import { GetPaginatedData } from '../model/dto/get-paginated-data';
import { Injectable } from '@nestjs/common';
import { Role } from '../../security/role/role.enum';
import { UserLoggedDto } from '../../auth/user-logged.dto';
import { UnauthorizedAppError } from '../../shared/exceptions/custom/unauthorized.error';
import { ERROR_MESSAGES } from '../../shared/exceptions/error-messages.enum';
import { SpreadsheetMetadata } from '../model/spreadsheet.metadata.entity';

@Injectable()
export class GetSpreadsheetByIdUseCase {
  constructor(
    private readonly metadataService: MetadataService,
    private readonly dynamicTableRepository: DynamicTableRepository,
  ) { }

  async execute(
    spreadsheetId: string,
    filters: SpreadsheetFiltersDto,
    userLogged: UserLoggedDto,
  ): Promise<SpreadsheetViewResponseDto> {

    const metadata = await this.metadataService.getMetadata(spreadsheetId);

    this.validateUserAccess(metadata, userLogged);

    const tableName = metadata.tableName;
    const allColumns = await this.dynamicTableRepository.getTableColumns(tableName);


    const getDataDTO = new GetPaginatedData(filters, allColumns)

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

  private validateUserAccess(metadata: SpreadsheetMetadata, userLogged: UserLoggedDto): void {
    if (userLogged.role === Role.CLIENT) {
      if (metadata.client?.id !== userLogged.clientId) {
        throw new UnauthorizedAppError(ERROR_MESSAGES.UNAUTHORIZED_SPREADSHEET_ACCESS);
      }
    }

    if (userLogged.role === Role.USER) {
      if (metadata.team?.id !== userLogged.teamId) {
        throw new UnauthorizedAppError(ERROR_MESSAGES.UNAUTHORIZED_SPREADSHEET_ACCESS);
      }
    }
  }
}
