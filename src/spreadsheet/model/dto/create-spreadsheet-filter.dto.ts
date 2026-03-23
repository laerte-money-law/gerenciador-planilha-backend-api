import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { SpreadsheetView } from "../enum/spreadsheet-status-view.enum";

export class SpreadsheetFiltersDto {
    @IsOptional()
    @IsString()
    search?: string;
    
    @IsOptional()
    @IsEnum(SpreadsheetView)
    view?: 'inicial' | 'pendente' | 'analise' | 'concluido';

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit: number = 15;
}