import { Module } from '@nestjs/common';
import { SpreadsheetController } from './spreadsheets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spreadsheet } from './model/entities/spreadsheet.entity';
import { Row } from './model/entities/row.entity';
import { Cell } from './model/entities/cell.entity';
import { CellWriteRepository } from './repository/cell/cell.write.repository';
import { SpreadsheetService } from './spreadsheets.service';
import { ColumnReadRepository } from './repository/cell/column.read.repository';
import { ColumnWriteRepository } from './repository/cell/column.write.repository';
import { SpreadsheetReadRepository } from './repository/spreadsheet.read.repository';
import { ColumnEntity } from './model/entities/column.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Spreadsheet,
      Row,
      Cell,
      ColumnEntity,
    ]),
  ],
  controllers: [SpreadsheetController],
  providers: [
    SpreadsheetService,

    CellWriteRepository,
    ColumnWriteRepository,

    ColumnReadRepository,
    SpreadsheetReadRepository,
  ],
  exports: [
    SpreadsheetService,
  ],
})
export class SpreadsheetModule {}
