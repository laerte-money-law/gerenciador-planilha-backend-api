import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { SpreadsheetStatusEnum } from "../enum/spreadsheet-status.enum";
import { Type } from "class-transformer";

export class SpreadsheetFiltersDto{
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(SpreadsheetStatusEnum)
    status?: SpreadsheetStatusEnum;

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