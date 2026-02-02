import { Expose, Type } from "class-transformer";
import { IsInt, IsString } from "class-validator";

export class CreateSpreadsheetDto {
  @Expose({ name: 'team_id' })
  @Type(() => Number)
  @IsInt()
  teamId: number;
  @IsString()
  service: string;
  @IsString()     
  status: string; 
}
