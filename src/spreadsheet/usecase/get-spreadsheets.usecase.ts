import { Injectable } from '@nestjs/common';
import { MetadataService } from '../services/metadata.service';
import { PaginatedResponseDto } from '../../shared/dto/paginated-response.dto';
import { SpreadsheetListItemDto } from '../model/dto/spreadsheet-list-item.dto';
import { UserLoggedDto } from '../../auth/user-logged.dto';

@Injectable()
export class GetSpreadsheetsUseCase {
  constructor(
    private readonly metadataService: MetadataService,
  ) { }

  async execute(
    userLogged: UserLoggedDto,
    page = 1,
    limit = 15,
  ): Promise<PaginatedResponseDto<SpreadsheetListItemDto>> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.metadataService.getSpreadsheets(userLogged, skip, limit);

    return new PaginatedResponseDto(
      items.map((item) => SpreadsheetListItemDto.fromEntity(item)),
      page,
      limit,
      total,
    );
  }
}
