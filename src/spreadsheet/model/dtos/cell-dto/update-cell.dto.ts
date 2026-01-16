import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateCellDto {
  @IsInt()
  rowId: number;

  @IsInt()
  columnId: number;

  @IsOptional()
  @IsString()
  value: string | null;
}
