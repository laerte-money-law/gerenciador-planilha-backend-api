import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('spreadsheet')
export class Spreadsheet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  team_id: number;

  @Column()
  created_by: number;

  @CreateDateColumn()
  created_at: Date;
}
