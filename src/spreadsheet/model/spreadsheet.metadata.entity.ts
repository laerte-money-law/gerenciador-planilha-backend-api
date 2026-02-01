import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('spreadsheet_metadata')
export class SpreadsheetMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'table_name', type: 'nvarchar', length: 255 })
  tableName: string;

  @Column({ name: 'original_filename', type: 'nvarchar', length: 255 })
  originalFileName: string;

  @Column({ name: 'team_id', type: 'int' })
  teamId: number;

  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @Column({
    name: 'created_at',
    type: 'datetime2',
    default: () => 'SYSDATETIME()',
  })
  createdAt: Date;
}
