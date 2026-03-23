import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SpreadsheetMetadata } from './model/spreadsheet.metadata.entity';
import { Role } from 'src/security/role/role.enum';
import { PaginatedResponseDto } from 'src/shared/dto/paginated-response.dto';
import { SpreadsheetListItemDto } from './model/dto/spreadsheet-list-item.dto';
import { SpreadsheetViewResponseDto } from './model/dto/spreadsheet-view-response.dto';
import { SpreadsheetFiltersDto } from './model/dto/create-spreadsheet-filter.dto';
import { AddColumnInSpreadsheetUseCase } from './usecase/add-column-in-spreadsheet.usecase';
import { AddColumnDto } from './model/dto/add-column.dto';
import { AddColumnResponseDto } from './model/dto/add-column.response.dto';
import { DeleteColumnInSpreadsheet } from './usecase/delete-column-in-spreadsheet';
import {
  DeleteColumnDto,
  DeleteColumnResponseDto,
} from './model/dto/delete-column.dto';
import { GetSpreadsheetColumnsResponseDto } from './model/dto/get-spreadsheet-columns.dto';
import { UpdateSpreadsheetRowUsecase } from './usecase/update-spreadsheet-row.usecase';
import { UpdateSpreadsheetRowResponseDto } from './model/dto/update-spreadsheet-row.dto';
import { ExportSpreadsheetUsecase } from './usecase/export-spreadsheet.usecase';
import { DeleteSpreadsheetByIdUseCase } from './usecase/delete-spreadsheet-by-id.usecase';
import { GetSpreadsheetInformationUseCase } from './usecase/get-spreadsheet-information.usecase';
import { ClientOutputDto } from '../client/model/dto/client.ouput.dto';
import { ImportSpreadsheetUseCaseV2 } from './usecase/import-spreadsheet.usecaseV2';
import { User } from '../users/model/user.entity';

import { GetSpreadsheetsUseCase } from './usecase/get-spreadsheets.usecase';
import { GetSpreadsheetByIdUseCase } from './usecase/get-spreadsheet-by-id.usecase';
import { MetadataService } from './services/metadata.service';
import { UserLoggedDto } from '../auth/user-logged.dto';

@Injectable()
export class SpreadsheetService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
    private readonly addColumnInSpreadsheet: AddColumnInSpreadsheetUseCase,
    private readonly deleteColumnInSpreadsheet: DeleteColumnInSpreadsheet,
    private readonly updateSpreadsheetRowUsecase: UpdateSpreadsheetRowUsecase,
    private readonly exportSpreadsheetUsecase: ExportSpreadsheetUsecase,
    private readonly deleteSpreadsheetByIdUseCase: DeleteSpreadsheetByIdUseCase,
    private readonly getSpreadsheetInformationUseCase: GetSpreadsheetInformationUseCase,
    private readonly importSpreadsheetUseCaseV2: ImportSpreadsheetUseCaseV2,
    private readonly getSpreadsheetsUseCase: GetSpreadsheetsUseCase,
    private readonly getSpreadsheetByIdUseCase: GetSpreadsheetByIdUseCase,
    private readonly metadataService: MetadataService,
  ) { }

  async importSpreadsheetV2(
    user: User,
    file: Express.Multer.File,
    teamId: number,
    clientId: number,
    service: string,
  ) {
    return this.importSpreadsheetUseCaseV2.execute(user, {
      file,
      teamId,
      clientId,
      service,
    });
  }

  async getSpreadsheets(
    userLogged: UserLoggedDto,
    page = 1,
    limit = 15,
  ): Promise<PaginatedResponseDto<SpreadsheetListItemDto>> {
    return this.getSpreadsheetsUseCase.execute(userLogged, page, limit);
  }

  async getSpreadsheetByIdPaginatedV2(
    spreadsheetId: string,
    userLogged: UserLoggedDto,
    filters: SpreadsheetFiltersDto,
  ): Promise<SpreadsheetViewResponseDto> {
    return this.getSpreadsheetByIdUseCase.execute(spreadsheetId, filters, userLogged);
  }
  async exportSpreadsheet(spreadsheetId: string, userLogged: UserLoggedDto) {
    return await this.exportSpreadsheetUsecase.execute(
      spreadsheetId,
      userLogged.role,
      userLogged.teamId as number,
    );
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
    userLogged: UserLoggedDto,
  ): Promise<GetSpreadsheetColumnsResponseDto> {
    return this.getSpreadsheetInformationUseCase.execute(spreadsheetId);
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

  deleteSpreadsheet(spreadsheetId: string) {
    return this.deleteSpreadsheetByIdUseCase.execute(spreadsheetId);
  }
}
