import { InjectRepository } from '@nestjs/typeorm';
import { SpreadsheetMetadata } from '../model/spreadsheet.metadata.entity';
import { Repository } from 'typeorm';
import { NotFoundAppError } from '../../shared/exceptions/custom/not-found.error';
import { ERROR_MESSAGES } from '../../shared/exceptions/error-messages.enum';
import { UserLoggedDto } from '../../auth/user-logged.dto';
import { Role } from '../../security/role/role.enum';

export class MetadataService {
  constructor(
    @InjectRepository(SpreadsheetMetadata)
    private readonly metadataRepository: Repository<SpreadsheetMetadata>,
  ) {}

  public async getMetadata(spreadsheetId: string){

    const metadata = await this.metadataRepository.findOne({
      where: { id: spreadsheetId },
      relations: ['client', 'team']
    });

    if (!metadata) {
      throw new NotFoundAppError(ERROR_MESSAGES.SPREADSHEET_NOT_FOUND);
    }

    return metadata;
  }

  public async getSpreadsheets(userLogged: UserLoggedDto, skip: number, limit: number) {
    let whereCondition: any = {};

    if (userLogged.role === Role.CLIENT) {
      whereCondition = { client: { id: userLogged.clientId } };
    } else if (userLogged.role === Role.USER) {
      whereCondition = { team: { id: userLogged.teamId } };
    }

    return await this.metadataRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: {
        team: true,
        client: true,
      },
    });
  }

}