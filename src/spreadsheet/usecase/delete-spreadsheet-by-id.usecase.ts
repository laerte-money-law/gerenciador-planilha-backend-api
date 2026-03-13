import { Injectable, Logger } from '@nestjs/common';
import { DynamicTableRepository } from '../../infra/repository/dynamic-table.repository';
import { MetadataService } from '../services/metadata.service';
import { InjectRepository } from '@nestjs/typeorm';
import { SpreadsheetMetadata } from '../model/spreadsheet.metadata.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DeleteSpreadsheetByIdUseCase {
  private readonly logger = new Logger(DeleteSpreadsheetByIdUseCase.name);

  constructor(
    private readonly metadataService: MetadataService,
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
    private readonly dynamicTableRepository: DynamicTableRepository,
  ) {}

  public async execute(spreadsheetId: string): Promise<void> {
    this.logger.log(`Iniciando exclusão da planilha com ID: ${spreadsheetId}`);

    const spreadsheet = await this.metadataService.getMetadata(spreadsheetId);

    await this.dynamicTableRepository.deleteTable(spreadsheet.tableName);

    this.logger.log(`Tabela ${spreadsheet.tableName}  excluída com sucesso.`);

    await this.metadataRepository.delete({ id: spreadsheetId });

    this.logger.log(
      `Metadados da planilha com ID ${spreadsheetId} excluídos com sucesso.`,
    );
  }
}
