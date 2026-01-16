import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ColumnEntity } from "src/spreadsheet/model/entities/column.entity";
import { Repository } from "typeorm";

@Injectable()
export class ColumnWriteRepository {
  constructor(
    @InjectRepository(ColumnEntity)
    private readonly columnRepository: Repository<ColumnEntity>,
  ) {}

  async create(params: {
    spreadsheetId: number;
    title: string;
    orderIndex: number;
  }): Promise<ColumnEntity> {
    const column = this.columnRepository.create({
      spreadsheet_id: params.spreadsheetId,
      title: params.title,
      order_index: params.orderIndex,
    });

    return this.columnRepository.save(column);
  }

  async updateTitle(columnId: number, title: string): Promise<void> {
    await this.columnRepository.update(
      { id: columnId },
      { title },
    );
  }
}
