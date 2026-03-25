import { COLUMN_TYPE, ColumnDto } from './model/dto/column.dto';
import { ROW_STATUS } from './model/enum/row-status.enum';

/**
 * MoneyLaw GEP - Default column name constants
 * These columns are automatically created in every dynamic spreadsheet table.
 */
export const ML_COLUMN_ID = 'ML_ID';
export const ML_COLUMN_STATUS = 'ML_STATUS';
export const ML_COLUMN_USER_ATRIBUIDO = 'ML_USER_ATRIBUIDO';

/**
 * MoneyLaw GEP - Default columns added to every dynamic spreadsheet table.
 * These columns are prepended to the user-defined columns during table creation.
 * ML_STATUS must be empty during the import process and will be updated later by the system based on the analysis of each row
 */
export const MONEY_LAW_GEP_DEFAULT_COLUMNS: ColumnDto[] = [
  new ColumnDto(ML_COLUMN_ID, COLUMN_TYPE.PRIMARY_KEY),
  new ColumnDto(ML_COLUMN_STATUS, COLUMN_TYPE.STATUS, ''),
  new ColumnDto(ML_COLUMN_USER_ATRIBUIDO, COLUMN_TYPE.STRING, ''),
];
