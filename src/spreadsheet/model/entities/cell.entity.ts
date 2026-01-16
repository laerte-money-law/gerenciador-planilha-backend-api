import { Entity, Unique, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('cell')
@Unique(['row_id', 'column_id'])
export class Cell {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  row_id: number;

  @Column()
  column_id: number;

  @Column({ type: 'text', nullable: true })
  value: string | null;

  @Column()
  last_edited_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
