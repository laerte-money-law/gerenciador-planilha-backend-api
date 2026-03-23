import { ROW_STATUS } from '../enum/row-status.enum';
import { SpreadsheetFiltersDto } from './create-spreadsheet-filter.dto';

export class GetPaginatedData {
  page: number;
  limit: number;
  status?: string[];
  notStatus?: string;
  search?: string;
  isInitialView?: boolean;

  constructor(filters: SpreadsheetFiltersDto) {
    this.page = filters.page;
    this.limit = filters.limit;
    this.search = filters.search;

    switch (filters.view) {
      case 'inicial':
        this.status = [ROW_STATUS.EM_ANALISE];
        this.isInitialView = true;
        break;

      case 'pendente':
        this.status = [ROW_STATUS.COM_PENDENCIA];
        break;

      case 'analise':
        this.status = [
          ROW_STATUS.AG_VALIDACAO,
          ROW_STATUS.NAO_LOCALIZADO,
          ROW_STATUS.SEM_ACESSO_BANCARIO,
        ];
        break;

      case 'concluido':
        this.status = [ROW_STATUS.VALIDADO];
        break;

      default:
        // comportamento padrão
        this.notStatus = ROW_STATUS.VALIDADO;
    }
  }
}