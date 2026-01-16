import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cell } from 'src/spreadsheet/model/entities/cell.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CellWriteRepository {
  constructor(
    @InjectRepository(Cell)
    private readonly cellRepository: Repository<Cell>,
  ) {}

  async upsert(params: {
    rowId: number;
    columnId: number;
    value: string | null;
    userId: number;
  }): Promise<void> {
    const existingCell = await this.cellRepository.findOne({
      where: {
        row_id: params.rowId,
        column_id: params.columnId,
      },
    });

    if (existingCell) {
      existingCell.value = params.value;
      existingCell.last_edited_by = params.userId;

      await this.cellRepository.save(existingCell);
      return;
    }

    const newCell = this.cellRepository.create({
      row_id: params.rowId,
      column_id: params.columnId,
      value: params.value,
      last_edited_by: params.userId,
    });

    await this.cellRepository.save(newCell);
  }
}
