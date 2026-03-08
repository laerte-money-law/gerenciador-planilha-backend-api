import { Module } from '@nestjs/common';
import { SpreadsheetController } from './spreadsheets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpreadsheetService } from './spreadsheets.service';
import { SpreadsheetMetadata } from './model/spreadsheet.metadata.entity';
import { ImportSpreadsheetUsecase } from './usecase/import-spreadsheet.usecase';
import { AddColumnInSpreadsheetUseCase } from './usecase/add-column-in-spreadsheet.usecase';
import { DeleteColumnInSpreadsheet } from './usecase/delete-column-in-spreadsheet';
import { UpdateSpreadsheetRowUsecase } from './usecase/update-spreadsheet-row.usecase';
import { ExportSpreadsheetUsecase } from './usecase/export-spreadsheet.usecase';
import { Attachment } from 'src/attachment/model/attachment.entity';
import { DeleteSpreadsheetByIdUseCase } from './usecase/delete-spreadsheet-by-id.usecase';
import { InfraModule } from '../infra/infra.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpreadsheetMetadata,
      Attachment
    ]),
    InfraModule,
  ],
  controllers: [SpreadsheetController],
  providers: [
    SpreadsheetService,
    ImportSpreadsheetUsecase,
    AddColumnInSpreadsheetUseCase,
    DeleteColumnInSpreadsheet,
    UpdateSpreadsheetRowUsecase,
    ExportSpreadsheetUsecase,
    DeleteSpreadsheetByIdUseCase
  ],
  exports: [
    SpreadsheetService,
  ],
})
export class SpreadsheetModule {}
