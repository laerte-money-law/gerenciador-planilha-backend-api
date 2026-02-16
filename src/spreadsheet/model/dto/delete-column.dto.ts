import { IsString } from 'class-validator';

export class DeleteColumnDto {
  @IsString()
  columnName: string;
}

export class DeleteColumnResponseDto {
  deleted: boolean;
  table: string;
  column: string;
  message: string;
}

