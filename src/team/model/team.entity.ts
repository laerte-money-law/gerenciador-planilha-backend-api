import { SpreadsheetMetadata } from "../../spreadsheet/model/spreadsheet.metadata.entity"
import { User } from "../../users/model/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('team')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.team)
  users: User[];

  @OneToMany(
    () => SpreadsheetMetadata,
    (spreadsheet) => spreadsheet.team
  )
  spreadsheets: SpreadsheetMetadata[];
}
