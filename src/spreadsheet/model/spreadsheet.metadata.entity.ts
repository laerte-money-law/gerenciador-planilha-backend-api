import { Team } from "../../team/model/team.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinColumn, ManyToOne } from "typeorm";
import { Client } from '../../client/model/client.entity';

@Entity('spreadsheet_metadata')
export class SpreadsheetMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'table_name', type: 'nvarchar', length: 255 })
  tableName: string;

  @Column({ name: 'original_filename', type: 'nvarchar', length: 255 })
  originalFileName: string;

  @ManyToOne(() => Team, (team) => team.spreadsheets, { eager: false })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'service', type: 'nvarchar', length: 100, nullable: true })
  service: string;

  @Column({ name: 'status', type: 'nvarchar', length: 50, nullable: true })
  status: string;

  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @Column({
    name: 'created_at',
    type: 'datetime2',
    default: () => 'SYSDATETIME()',
  })
  createdAt: Date;
}
