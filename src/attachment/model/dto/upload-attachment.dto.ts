import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ATTACHMENT_TYPE } from "../enum/attachment.enum";
import { Type } from "class-transformer";

export class AttachmentUploadDto {
    @IsString()
    spreadsheetMetadataId: string;
    @Type(() => Number)
    @IsNumber()
    rowId: number;
    @IsOptional()
    @IsString()
    description?: string
    @IsEnum(ATTACHMENT_TYPE)
    fileType?: ATTACHMENT_TYPE;
}