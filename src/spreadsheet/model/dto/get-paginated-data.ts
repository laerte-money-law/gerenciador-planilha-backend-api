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
    this.limit = filters.limit;
    this.search = filters.search;

    if (!filters.status) {
      this.notStatus = ROW_STATUS.VALIDADO;
      return;
    }

    if (filters.status === ROW_STATUS.VALIDADO) {
      this.status = ROW_STATUS.VALIDADO;
      return;
    }

    this.status = filters.status;
  }
}