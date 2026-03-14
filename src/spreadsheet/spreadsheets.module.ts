import { Module } from '@nestjs/common';
import { SpreadsheetController } from './spreadsheets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpreadsheetService } from './spreadsheets.service';
import { SpreadsheetMetadata } from './model/spreadsheet.metadata.entity';
import { AddColumnInSpreadsheetUseCase } from './usecase/add-column-in-spreadsheet.usecase';
import { DeleteColumnInSpreadsheet } from './usecase/delete-column-in-spreadsheet';
import { UpdateSpreadsheetRowUsecase } from './usecase/update-spreadsheet-row.usecase';
import { ExportSpreadsheetUsecase } from './usecase/export-spreadsheet.usecase';
import { Attachment } from 'src/attachment/model/attachment.entity';
import { DeleteSpreadsheetByIdUseCase } from './usecase/delete-spreadsheet-by-id.usecase';
import { InfraModule } from '../infra/infra.module';
import { GetSpreadsheetInformationUseCase } from './usecase/get-spreadsheet-information.usecase';
import { ImportSpreadsheetUseCaseV2 } from './usecase/import-spreadsheet.usecaseV2';
import { CreateSpreadsheetService } from './services/create-spreadsheet.service';
import { Client } from '../client/model/client.entity';
import { Team } from '../team/model/team.entity';
import { ImportSpreadsheetFactory } from './infra/spreadsheet-import.factory';
import { GetSpreadsheetByIdUseCase } from './usecase/get-spreadsheet-by-id.usecase';
import { MetadataService } from './services/metadata.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpreadsheetMetadata, Attachment, Client, Team]),
    InfraModule,
  ],
  controllers: [SpreadsheetController],
  providers: [
    SpreadsheetService,
    AddColumnInSpreadsheetUseCase,
    DeleteColumnInSpreadsheet,
    UpdateSpreadsheetRowUsecase,
    ExportSpreadsheetUsecase,
    DeleteSpreadsheetByIdUseCase,
    GetSpreadsheetInformationUseCase,
    ImportSpreadsheetUseCaseV2,
    ImportSpreadsheetFactory,
    CreateSpreadsheetService,
    GetSpreadsheetByIdUseCase,
    MetadataService
  ],
  exports: [SpreadsheetService],
})
export class SpreadsheetModule {}
