import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SpreadsheetMetadata } from '../model/spreadsheet.metadata.entity';
import { NotFoundAppError } from '../../shared/exceptions/custom/not-found.error';
import { ERROR_MESSAGES } from '../../shared/exceptions/error-messages.enum';
import { DynamicTableRepository } from '../../infra/repository/dynamic-table.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DeleteSpreadsheetByIdUseCase {
  private readonly logger = new Logger(DeleteSpreadsheetByIdUseCase.name);

  constructor(
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
    private readonly dynamicTableRepository: DynamicTableRepository,
  ) {}

  public async execute(spreadsheetId: string): Promise<void> {
    this.logger.log(`Iniciando exclusão da planilha com ID: ${spreadsheetId}`);

    const spreadsheet = await this.metadataRepository.findOneBy({
      id: spreadsheetId,
    });

    if (!spreadsheet) {
      throw new NotFoundAppError(ERROR_MESSAGES.SPREADSHEET_NOT_FOUND);
    }

    await this.dynamicTableRepository.deleteTable(spreadsheet.tableName);

    this.logger.log(`Tabela ${spreadsheet.tableName}  excluída com sucesso.`);

    await this.metadataRepository.delete({ id: spreadsheetId });

    this.logger.log(
      `Metadados da planilha com ID ${spreadsheetId} excluídos com sucesso.`,
    );
  }
}
