import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('attachments')
@Index(['spreadsheetMetadataId', 'rowId'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  contentType: string;

  @Column('bigint')
  size: number;

  @Column({ type: 'varbinary', length: 'max' })
  data: Buffer;

  @Column('uniqueidentifier')
  spreadsheetMetadataId: string;

  @Column('int')
  rowId: number;

  @CreateDateColumn()
  createdAt: Date;
}
