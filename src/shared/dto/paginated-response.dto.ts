export class PaginatedResponseDto<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;

  constructor(data: T[], page: number, limit: number, total: number) {
    this.data = data;
    this.page = page;
    this.limit = limit;
    this.total = total;
  }
}
