import { InjectRepository } from '@nestjs/typeorm';
import { SpreadsheetMetadata } from '../model/spreadsheet.metadata.entity';
import { Repository } from 'typeorm';
import { ERROR_MESSAGES } from '../../shared/exceptions/error-messages.enum';
import { ImportSpreadsheetDto } from '../model/dto/import-spreadsheet.dto';
import { User } from '../../users/model/user.entity';
import { Client } from '../../client/model/client.entity';
import { Team } from '../../team/model/team.entity';
import { NotFoundAppError } from '../../shared/exceptions/custom/not-found.error';
import { SpreadsheetStatusEnum } from '../model/enum/spreadsheet-status.enum';
import { DynamicTableRepository } from '../../infra/repository/dynamic-table.repository';
import { ImportSpreadsheetFactory } from '../infra/spreadsheet-import.factory';
import { Logger } from '@nestjs/common';
import { COLUMN_TYPE, ColumnDto } from '../model/dto/column.dto';
import { ROW_STATUS } from '../model/enum/row-status.enum';

export class ImportSpreadsheetUseCaseV2 {
  private readonly logger = new Logger(ImportSpreadsheetUseCaseV2.name);

  constructor(
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly importSpreadsheetFactory: ImportSpreadsheetFactory,
    private readonly dynamicTableRepository: DynamicTableRepository,
  ) {}

  public async execute(user: User, importSpreadsheetDto: ImportSpreadsheetDto) {
    this.logger.log(
      `Iniciando importação de planilha para o usuário ${user.id} com os dados: ${JSON.stringify(importSpreadsheetDto)}`,
    );

    const file = importSpreadsheetDto.file;
    const tableName = `spreadsheet_${Date.now()}`;

    await this.createInternalSpreadsheetTable(tableName, file);

    //todo: salvar metadados na planilha
    const client = await this.getClientOrThrow(importSpreadsheetDto.clientId);
    const team = await this.getTeamOrThrow(importSpreadsheetDto.teamId);

    const metadata: SpreadsheetMetadata = {
      id: 1, //remove this
      tableName,
      originalFileName: file.originalname,
      team,
      client,
      createdBy: user.id,
      createdAt: new Date(),
      service: importSpreadsheetDto.service,
      status: SpreadsheetStatusEnum.IN_PROGRESS,
    };

    const savedMetadata = await this.metadataRepository.save(metadata);
  }

  private async getClientOrThrow(clientId: number) {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundAppError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
    }

    return client;
  }

  private async getTeamOrThrow(teamId: number) {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });

    if (!team) {
      throw new NotFoundAppError(ERROR_MESSAGES.TEAM_NOT_FOUND);
    }

    return team;
  }

  private async createInternalSpreadsheetTable(
    tableName: string,
    file: Express.Multer.File,
  ) {
    //todo: criar tabela dinâmica com base no arquivo recebido e preencher os dados
    const importer = this.importSpreadsheetFactory.getImporter(file);

    //todo: validar e adicionar MoneyLawGEP ML_ID, ML_STATUS?
    const columnsDtos = importer.getHeaders();

    const ML_PRIMARY_KEY_COLUMN = new ColumnDto('ML_ID', COLUMN_TYPE.PRIMARY_KEY);
    const ML_ROW_STATUS_COLUMN = new ColumnDto('ML_STATUS', COLUMN_TYPE.STATUS, ROW_STATUS.IMPORTED);
    const ML_ROW_LAWYER_ASSIGNED = new ColumnDto('ML_USER_ATRIBUIDO', COLUMN_TYPE.STRING, '');

    columnsDtos.push(ML_PRIMARY_KEY_COLUMN, ML_ROW_STATUS_COLUMN, ML_ROW_LAWYER_ASSIGNED);

    await this.dynamicTableRepository.createTable(tableName, columnsDtos);

    //todo: validar e adicionar linhas na tabela criada
    let values = importer.getRows();
    const columns = columnsDtos.map((columnDto) => columnDto.name);

    await this.dynamicTableRepository.insertIntoTable(
      tableName,
      columns,
      values,
    );
  }
}
