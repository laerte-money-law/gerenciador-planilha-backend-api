import { SqlBuilderService } from './sql-builder.service';
import { COLUMN_TYPE, ColumnDto } from '../../spreadsheet/model/dto/column.dto';
import { GetPaginatedData } from '../../spreadsheet/model/dto/get-paginated-data';
import { ROW_STATUS } from '../../spreadsheet/model/enum/row-status.enum';

describe('SqlBuilderService', () => {
  let service: SqlBuilderService;

  beforeEach(() => {
    service = new SqlBuilderService();
  });

  describe('DELETE_TABLE', () => {
    it('given a table name, when DELETE_TABLE is called, then it should return a drop table query', () => {
      const tableName = 'test_table';
      const result = service.DELETE_TABLE(tableName);
      expect(result).toBe('DROP TABLE IF EXISTS dbo.test_table;');
    });
  });

  describe('GET_TABLE_COLUMNS', () => {
    it('given a table name, when GET_TABLE_COLUMNS is called, then it should return a select top 1 query', () => {
      const tableName = 'test_table';
      const result = service.GET_TABLE_COLUMNS(tableName);
      expect(result).toBe('SELECT TOP 1 * FROM dbo.[test_table];');
    });
  });

  describe('CREATE_TABLE', () => {
    it('given a table name and columns, when CREATE_TABLE is called, then it should return a create table query with joined column definitions', () => {
      const tableName = 'test_table';
      const columns = [
        new ColumnDto('id', COLUMN_TYPE.PRIMARY_KEY),
        new ColumnDto('name', COLUMN_TYPE.STRING),
        new ColumnDto('status', COLUMN_TYPE.STATUS, 'ACTIVE')
      ];
      
      const result = service.CREATE_TABLE(tableName, columns);
      
      expect(result).toBe('CREATE TABLE dbo.[test_table] ([id] INT IDENTITY(1, 1) PRIMARY KEY, [name] VARCHAR(MAX), [status] VARCHAR(50) DEFAULT \'ACTIVE\')');
    });
  });

  describe('INSERT_INTO', () => {
    it('given table name, columns and values, when INSERT_INTO is called, then it should return a valid insert statement', () => {
      const tableName = 'test_table';
      const columns = ['name', 'age'];
      const values = [['John Doe', '30'], ['Jane \'Doe\'', '25']];

      const result = service.INSERT_INTO(tableName, columns, values);

      expect(result).toBe("INSERT INTO dbo.[test_table] (name, age) VALUES ('John Doe','30'), ('Jane ''Doe''','25')");
    });
  });

  describe('GET_PAGINATED_DATA', () => {
    it('given table name and GetPaginatedData with status, when GET_PAGINATED_DATA is called, then it should return query with WHERE ML_STATUS = status', () => {
      const tableName = 'test_table';
      const getDataDTO = new GetPaginatedData({
        page: 2,
        limit: 10,
        status: ROW_STATUS.VALIDATED
      });
      // constructor logic for GetPaginatedData: if status is VALIDATED, it sets this.status = VALIDATED

      const result = service.GET_PAGINATED_DATA(tableName, getDataDTO);

      expect(result).toContain("SELECT * FROM dbo.[test_table] ");
      expect(result).toContain("WHERE ML_STATUS = 'VALIDADO'");
      expect(result).toContain("ORDER BY ML_ID ASC");
      expect(result).toContain("OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;");
    });

    it('given table name and GetPaginatedData with notStatus, when GET_PAGINATED_DATA is called, then it should return query with WHERE ML_STATUS <> notStatus', () => {
      const tableName = 'test_table';
      const getDataDTO = new GetPaginatedData({
        page: 1,
        limit: 15,
        status: ROW_STATUS.IMPORTED
      });
      // constructor logic for GetPaginatedData: if status is NOT VALIDATED, it sets this.notStatus = VALIDATED

      const result = service.GET_PAGINATED_DATA(tableName, getDataDTO);

      expect(result).toContain("SELECT * FROM dbo.[test_table] ");
      expect(result).toContain("WHERE ML_STATUS <> 'VALIDADO'");
      expect(result).toContain("OFFSET 0 ROWS FETCH NEXT 15 ROWS ONLY;");
    });

    it('given table name and GetPaginatedData without any status, when GET_PAGINATED_DATA is called, then it should return query WITHOUT where clause (if possible by DTO)', () => {
      const tableName = 'test_table';
      // We bypass the constructor to test the search logic or empty conditions if needed, 
      // but the current DTO constructor always sets notStatus or status.
      // Let's create a partial mock if we want to test empty where.
      const getDataDTO = {
        page: 1,
        limit: 20
      } as GetPaginatedData;

      const result = service.GET_PAGINATED_DATA(tableName, getDataDTO);

      expect(result).toBe("SELECT * FROM dbo.[test_table]  ORDER BY ML_ID ASC OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY;");
    });
  });

  describe('GET_COUNT', () => {
    it('given table name and GetPaginatedData with status, when GET_COUNT is called, then it should return count query with WHERE clause', () => {
      const tableName = 'test_table';
      const getDataDTO = new GetPaginatedData({
        page: 1,
        limit: 10,
        status: ROW_STATUS.VALIDATED
      });

      const result = service.GET_COUNT(tableName, getDataDTO);

      expect(result).toBe("SELECT COUNT(1) as total FROM dbo.[test_table]  WHERE ML_STATUS = 'VALIDADO'");
    });

    it('given table name and GetPaginatedData without status, when GET_COUNT is called, then it should return count query without WHERE clause', () => {
      const tableName = 'test_table';
      const getDataDTO = { page: 1, limit: 10 } as GetPaginatedData;

      const result = service.GET_COUNT(tableName, getDataDTO);

      expect(result).toBe("SELECT COUNT(1) as total FROM dbo.[test_table] ");
    });
  });
});
