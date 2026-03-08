import { Injectable } from '@nestjs/common';

@Injectable()
export class SqlBuilderService {

    DELETE_TABLE(tableName: string): string {
        return `DROP TABLE IF EXISTS dbo.${tableName};`;
    }

}