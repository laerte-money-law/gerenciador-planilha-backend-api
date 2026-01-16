import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('column')
export class ColumnEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  spreadsheet_id: number;

  @Column()
  order_index: number;

  @CreateDateColumn()
  created_at: Date;
}
