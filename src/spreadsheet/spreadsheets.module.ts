import { Module } from '@nestjs/common';
import { SpreadsheetController } from './spreadsheets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpreadsheetService } from './spreadsheets.service';
import { SpreadsheetMetadata } from './model/spreadsheet.metadata.entity';
import { ImportSpreadsheetUsecase } from './usecase/import-spreadsheet.usecase';
import { AddColumnInSpreadsheetUseCase } from './usecase/add-column-in-spreadsheet.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpreadsheetMetadata,
    ]),
  ],
  controllers: [SpreadsheetController],
  providers: [
    SpreadsheetService,
    ImportSpreadsheetUsecase,
    AddColumnInSpreadsheetUseCase,
  ],
  exports: [
    SpreadsheetService,
  ],
})
export class SpreadsheetModule {}
