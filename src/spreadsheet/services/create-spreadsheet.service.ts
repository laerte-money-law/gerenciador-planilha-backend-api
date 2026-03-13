import { ImportSpreadsheetFactory } from '../infra/spreadsheet-import.factory';
import { ColumnDto } from '../model/dto/column.dto';
import { DynamicTableRepository } from '../../infra/repository/dynamic-table.repository';
import { Injectable, Logger } from '@nestjs/common';
import { MONEY_LAW_GEP_DEFAULT_COLUMNS } from '../constants';

@Injectable()
export class CreateSpreadsheetService {
  private readonly logger = new Logger(CreateSpreadsheetService.name);

  constructor(
    private readonly importSpreadsheetFactory: ImportSpreadsheetFactory,
    private readonly dynamicTableRepository: DynamicTableRepository,
  ) { }

  async execute(tableName: string, file: Express.Multer.File) {
    //todo: criar tabela dinâmica com base no arquivo recebido e preencher os dados
    const importer = this.importSpreadsheetFactory.getImporter(file);

    //todo: validar e adicionar MoneyLawGEP ML_ID, ML_STATUS?
    const columnsDtos = importer.getHeaders();
    await this.createTableInInternalDatabase(tableName, columnsDtos);

    //todo: validar e adicionar linhas na tabela criada
    const columns = columnsDtos.map((columnDto) =>
      columnDto.getSanitizedName(),
    );

    let values = importer.getRows();

    await this.insertInBatches(tableName, columns, values);
  }

  private async createTableInInternalDatabase(
    tableName: string,
    columns: ColumnDto[],
  ) {
    const finalColumns = [...MONEY_LAW_GEP_DEFAULT_COLUMNS, ...columns];
    await this.dynamicTableRepository.createTable(tableName, finalColumns);
  }

  private async insertInBatches(
    tableName: string,
    columns: string[],
    values: string[][],
    batchSize = 10,
  ): Promise<void> {
    this.logger.log(`Inserindo valores na tabela ${tableName} em batch de ${batchSize} linhas`);
    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);

      await this.dynamicTableRepository.insertIntoTable(
        tableName,
        columns,
        batch,
      );
    }

    this.logger.log(`Finalizando insercao na tabela ${tableName}`)
  }
}
