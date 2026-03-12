import { ROW_STATUS } from '../enum/row-status.enum';
import { SpreadsheetFiltersDto } from './create-spreadsheet-filter.dto';

export class GetPaginatedData {
  page: number;
  limit: number;
  status?: ROW_STATUS;
  notStatus?: ROW_STATUS;
  search?: string;

  constructor(filters: SpreadsheetFiltersDto) {
    this.page = filters.page;
    this.search = filters.search;
    this.limit = filters.limit;

    if (filters.status != ROW_STATUS.VALIDATED) {
      this.notStatus = ROW_STATUS.VALIDATED;
    } else {
      this.status = filters.status;
    }
  }
}