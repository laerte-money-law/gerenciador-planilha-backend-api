import { Test, TestingModule } from '@nestjs/testing';
import { DynamicTableRepository } from './dynamic-table.repository';
import { SqlBuilderService } from '../service/sql-builder.service';
import { DataSource } from 'typeorm';
import { InternalConfigAppError } from '../../shared/exceptions/custom/internal-config.error';
import { GetPaginatedData } from '../../spreadsheet/model/dto/get-paginated-data';

describe('DynamicTableRepository', () => {
  let repository: DynamicTableRepository;
  let sqlBuilderService: SqlBuilderService;
  let dataSource: DataSource;

  const mockSqlBuilderService = {
    DELETE_TABLE: jest.fn(),
    GET_TABLE_COLUMNS: jest.fn(),
    CREATE_TABLE: jest.fn(),
    INSERT_INTO: jest.fn(),
    GET_PAGINATED_DATA: jest.fn(),
    GET_COUNT: jest.fn(),
  };

  const mockDataSource = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamicTableRepository,
        { provide: SqlBuilderService, useValue: mockSqlBuilderService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    repository = module.get<DynamicTableRepository>(DynamicTableRepository);
    sqlBuilderService = module.get<SqlBuilderService>(SqlBuilderService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteTable', () => {
    it('given a table name, when deleteTable is executed successfully, then it should call dataSource.query', async () => {
      const tableName = 'test_table';
      mockSqlBuilderService.DELETE_TABLE.mockReturnValue('DROP TABLE query');
      mockDataSource.query.mockResolvedValue(undefined);

      await repository.deleteTable(tableName);

      expect(mockSqlBuilderService.DELETE_TABLE).toHaveBeenCalledWith(tableName);
      expect(mockDataSource.query).toHaveBeenCalledWith('DROP TABLE query');
    });

    it('given a table name, when dataSource.query throws an error, then it should throw InternalConfigAppError', async () => {
      const tableName = 'test_table';
      mockSqlBuilderService.DELETE_TABLE.mockReturnValue('DROP TABLE query');
      mockDataSource.query.mockRejectedValue(new Error('DB Error'));

      await expect(repository.deleteTable(tableName)).rejects.toThrow(InternalConfigAppError);
    });
  });

  describe('getTableColumns', () => {
    it('given a table name, when executed successfully, then it should return an array of column names', async () => {
      const tableName = 'test_table';
      mockSqlBuilderService.GET_TABLE_COLUMNS.mockReturnValue('SELECT columns');
      mockDataSource.query.mockResolvedValue([{ id: 1, name: 'test' }]);

      const result = await repository.getTableColumns(tableName);

      expect(result).toEqual(['id', 'name']);
    });

    it('given a table name, when query returns empty, then it should return an empty array', async () => {
      const tableName = 'empty_table';
      mockSqlBuilderService.GET_TABLE_COLUMNS.mockReturnValue('SELECT columns');
      mockDataSource.query.mockResolvedValue([]);

      const result = await repository.getTableColumns(tableName);

      expect(result).toEqual([]);
    });
  });

  describe('createTable', () => {
    it('given table name and columns, when executed successfully, then it should execute the create table query', async () => {
      const tableName = 'new_table';
      const columns = [] as any;
      mockSqlBuilderService.CREATE_TABLE.mockReturnValue('CREATE TABLE query');
      mockDataSource.query.mockResolvedValue(undefined);

      await repository.createTable(tableName, columns);

      expect(mockSqlBuilderService.CREATE_TABLE).toHaveBeenCalledWith(tableName, columns);
      expect(mockDataSource.query).toHaveBeenCalledWith('CREATE TABLE query');
    });
  });

  describe('insertIntoTable', () => {
    it('given table details and values, when executed successfully, then it should execute the insert query', async () => {
      const tableName = 'insert_table';
      const columns = ['col1'];
      const values = [['val1']];
      mockSqlBuilderService.INSERT_INTO.mockReturnValue('INSERT INTO query');
      mockDataSource.query.mockResolvedValue(undefined);

      await repository.insertIntoTable(tableName, columns, values);

      expect(mockSqlBuilderService.INSERT_INTO).toHaveBeenCalledWith(tableName, columns, values);
      expect(mockDataSource.query).toHaveBeenCalledWith('INSERT INTO query');
    });
  });

  describe('getDataTable', () => {
    it('given pagination dto, when executed successfully, then it should return the rows', async () => {
      const tableName = 'data_table';
      const dto = {} as GetPaginatedData;
      const expectedRows = [{ col: 'val' }];
      mockSqlBuilderService.GET_PAGINATED_DATA.mockReturnValue('SELECT data');
      mockDataSource.query.mockResolvedValue(expectedRows);

      const result = await repository.getDataTable(tableName, dto);

      expect(result).toBe(expectedRows);
      expect(mockSqlBuilderService.GET_PAGINATED_DATA).toHaveBeenCalledWith(tableName, dto);
    });
  });

  describe('getCount', () => {
    it('given filter dto, when executed successfully, then it should return the total count', async () => {
      const tableName = 'count_table';
      const dto = {} as GetPaginatedData;
      mockSqlBuilderService.GET_COUNT.mockReturnValue('SELECT COUNT');
      mockDataSource.query.mockResolvedValue([{ total: 100 }]);

      const result = await repository.getCount(tableName, dto);

      expect(result).toBe(100);
      expect(mockSqlBuilderService.GET_COUNT).toHaveBeenCalledWith(tableName, dto);
    });
  });
});
