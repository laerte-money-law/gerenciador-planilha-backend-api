import { IsString } from "class-validator";

export class CreateSpreadsheetDto {
  teamId: number;
  @IsString()
  service: string;
  @IsString()     
  status: string; 
}
