import { InjectRepository } from '@nestjs/typeorm';
import { SpreadsheetMetadata } from '../model/spreadsheet.metadata.entity';
import { Repository } from 'typeorm';
import { NotFoundAppError } from '../../shared/exceptions/custom/not-found.error';
import { ERROR_MESSAGES } from '../../shared/exceptions/error-messages.enum';

export class MetadataService {
  constructor(
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
  ) {}

  public async getMetadata(spreadsheetId: string){

    const metadata = await this.metadataRepository.findOne({
      where: { id: spreadsheetId },
    });

    if (!metadata) {
      throw new NotFoundAppError(ERROR_MESSAGES.SPREADSHEET_NOT_FOUND);
    }

    return metadata;
  }

}