import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('row')
export class Row {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  spreadsheet_id: number;

  @Column()
  status: string;

  @Column()
  order_index: number;
}
