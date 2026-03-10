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
import { CreateSpreadsheetService } from '../services/create-spreadsheet.service';

export class ImportSpreadsheetUseCaseV2 {
  private readonly logger = new Logger(ImportSpreadsheetUseCaseV2.name);

  constructor(
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    private readonly createSpreadsheetService: CreateSpreadsheetService,
  ) {}

  public async execute(user: any, importSpreadsheetDto: ImportSpreadsheetDto) {
    this.logger.log(
      `Iniciando importação de planilha para o usuário ${user.userId}`,
    );

    const file = importSpreadsheetDto.file;
    const tableName = `spreadsheet_${Date.now()}`;

    await this.createSpreadsheetService.execute(tableName, file);

    //todo: salvar metadados na planilha
    const client = await this.getClientOrThrow(importSpreadsheetDto.clientId);
    const team = await this.getTeamOrThrow(importSpreadsheetDto.teamId);

    const metadata = this.metadataRepository.create({
      tableName,
      originalFileName: file.originalname,
      team,
      client,
      createdBy: user.userId,
      createdAt: new Date(),
      service: importSpreadsheetDto.service,
      status: SpreadsheetStatusEnum.IN_PROGRESS
    });

    await this.metadataRepository.save(metadata);

    return {
      id: metadata.id,
      name: metadata.originalFileName,
      rowsImported: 999,
    };
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


}
