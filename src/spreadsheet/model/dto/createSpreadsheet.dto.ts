import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateSpreadsheetDto {
  @IsString()
  service: string;
  @IsString()     
  status: string;
  @IsString()
  clientId: number;
  @Type(() => Number)
  @IsNumber()
  teamId: number;
}
