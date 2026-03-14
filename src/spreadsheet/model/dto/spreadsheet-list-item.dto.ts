import { TeamDto } from "src/team/model/dto/teamDto";
import { ClientOutputDto } from '../../../client/model/dto/client.ouput.dto';

import { SpreadsheetMetadata } from '../spreadsheet.metadata.entity';

export class SpreadsheetListItemDto {
  id: string;
  name: string;
  team: TeamDto;
  client: ClientOutputDto;
  service: string;
  status: string;
  createdAt: Date;

  static fromEntity(entity: SpreadsheetMetadata): SpreadsheetListItemDto {
    return {
      id: entity.id,
      name: entity.originalFileName,
      team: entity.team as any,
      client: ClientOutputDto.fromEntity(entity.client),
      service: entity.service,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}
