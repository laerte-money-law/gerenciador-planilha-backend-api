import { IsString } from 'class-validator';
import { Utils } from '../../../shared/utils';

export class AddColumnDto {

  @IsString()
  columnName: string

  public getColumnName(): string {
    return Utils.normalizeColumnName(this.columnName);
  }
}