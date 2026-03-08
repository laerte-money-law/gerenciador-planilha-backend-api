import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SpreadsheetMetadata } from '../model/spreadsheet.metadata.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundAppError } from '../../shared/exceptions/custom/not-found.error';
import { ERROR_MESSAGES } from '../../shared/exceptions/error-messages.enum';
import { DynamicTableRepository } from '../../infra/repository/dynamic-table.repository';
import { GetSpreadsheetColumnsResponseDto } from '../model/dto/get-spreadsheet-columns.dto';

@Injectable()
export class GetSpreadsheetInformationUseCase {
  private readonly logger = new Logger(GetSpreadsheetInformationUseCase.name);

  constructor(
    @InjectRepository(SpreadsheetMetadata)
    private readonly spreadsheetMetadataRepository: Repository<SpreadsheetMetadata>,
    private readonly dynamicTableRepository: DynamicTableRepository,
  ) {}

  public async execute(spreadsheetId: string): Promise<GetSpreadsheetColumnsResponseDto> {
    this.logger.log(`Iniciando obtenção de informações da planilha com ID: ${spreadsheetId}`);
    const spreadsheetMetadata =
      await this.spreadsheetMetadataRepository.findOne({
        where: { id: spreadsheetId },
      });

    if (!spreadsheetMetadata) {
      throw new NotFoundAppError(ERROR_MESSAGES.SPREADSHEET_NOT_FOUND);
    }

    /*
    TODO: Avaliar se é necessário filtrar as colunas retornadas, por exemplo,
     para não retornar colunas de controle como 'created_by', 'last_updated_by', 'team_id' e 'created_at'.
     que sao colunas gerenciadas internamente e nao fazem parte dos dados do cliente.
    * [
                'created_by',
                'last_updated_by',
                'team_id',
                'created_at',
              ].includes(col),
    * */

    const columns = await this.dynamicTableRepository.getTableColumns(
      spreadsheetMetadata.tableName,
    );

    this.logger.log(`Finalizando obtenção de informações da planilha com ID: ${spreadsheetId}`);

    return new GetSpreadsheetColumnsResponseDto(
      spreadsheetMetadata.id,
      spreadsheetMetadata.tableName,
      columns,
    );
  }
}