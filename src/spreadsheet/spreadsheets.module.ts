import { Module } from '@nestjs/common';
import { SpreadsheetController } from './spreadsheets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpreadsheetService } from './spreadsheets.service';
import { SpreadsheetMetadata } from './model/spreadsheet.metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpreadsheetMetadata,
    ]),
  ],
  controllers: [SpreadsheetController],
  providers: [
    SpreadsheetService,
  ],
  exports: [
    SpreadsheetService,
  ],
})
export class SpreadsheetModule {}
