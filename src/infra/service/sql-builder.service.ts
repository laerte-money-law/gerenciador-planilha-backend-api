import { Injectable } from '@nestjs/common';

@Injectable()
export class SqlBuilderService {

    DELETE_TABLE(tableName: string): string {
        return `DROP TABLE IF EXISTS dbo.${tableName};`;
    }

    GET_TABLE_COLUMNS(tableName: string): string { 
      return `SELECT * FROM dbo.${tableName} LIMIT 1;`;
    }
}