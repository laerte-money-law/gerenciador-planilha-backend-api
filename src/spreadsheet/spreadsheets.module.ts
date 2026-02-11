import { Module } from '@nestjs/common';
import { SpreadsheetController } from './spreadsheets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpreadsheetService } from './spreadsheets.service';
import { SpreadsheetMetadata } from './model/spreadsheet.metadata.entity';
import {
  IMPORT_SPREADSHEET_CSV,
  ImportSpreadsheetCSV,
} from './strategy/importcsv';
import {
  IMPORT_SPREADSHEET_XLSX,
  ImportSpreadsheetXlsx,
} from './strategy/importxlsx';

@Module({
  imports: [TypeOrmModule.forFeature([SpreadsheetMetadata])],
  controllers: [SpreadsheetController],
  providers: [
    SpreadsheetService,
    {
      provide: IMPORT_SPREADSHEET_CSV,
      useClass: ImportSpreadsheetCSV,
    },
    {
      provide: IMPORT_SPREADSHEET_XLSX,
      useClass: ImportSpreadsheetXlsx,
    },
  ],
  exports: [SpreadsheetService],
})
export class SpreadsheetModule {}
