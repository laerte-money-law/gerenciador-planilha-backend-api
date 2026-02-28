import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class ClientSaveInputDto {
    @IsString()
    @IsNotEmpty()
    companyName: string;

    @IsString()
    @IsNotEmpty()
    cnpj: string;

    @IsString()
    @IsOptional()
    address: string;

    @IsString()
    @IsOptional()
    neighborhood: string;

    @IsString()
    @IsOptional()
    city: string;

    @IsString()
    @IsOptional()
    state: string;

    @IsString()
    @IsOptional()
    cep: string;

    @IsString()
    @IsOptional()
    contactName: string;

    @IsString()
    @IsOptional()
    @IsPhoneNumber("BR")
    @Transform(({ value }) => value?.trim() || undefined)
    contactPhone: string;

    @IsString()
    @IsOptional()
    @IsEmail()
    @Transform(({ value }) => value?.trim() || undefined)
    contactEmail: string;

}