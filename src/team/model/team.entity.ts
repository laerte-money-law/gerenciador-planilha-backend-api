import { SpreadsheetMetadata } from "../../spreadsheet/model/spreadsheet.metadata.entity"
import { User } from "../../users/model/user.entity";
import { Client } from "../../client/model/client.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('team')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => Client, (client) => client.teams)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => User, (user) => user.team)
  users: User[];

  @OneToMany(
    () => SpreadsheetMetadata,
    (spreadsheet) => spreadsheet.team
  )
  spreadsheets: SpreadsheetMetadata[];
}
