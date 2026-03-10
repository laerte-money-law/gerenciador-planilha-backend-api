import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { SpreadsheetStatusEnum } from "../enum/spreadsheet-status.enum";
import { Type } from "class-transformer";
import { ROW_STATUS } from '../enum/row-status.enum';

export class SpreadsheetFiltersDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(ROW_STATUS)
    status?: ROW_STATUS;

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