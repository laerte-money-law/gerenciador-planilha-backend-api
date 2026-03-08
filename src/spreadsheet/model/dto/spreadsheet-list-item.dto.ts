import { TeamDto } from "src/team/model/dto/teamDto";
import { ClientOutputDto } from '../../../client/model/dto/client.ouput.dto';

export class SpreadsheetListItemDto {
  id: string;
  name: string;
  team: TeamDto;
  client: ClientOutputDto;
  service: string;
  createdAt: Date;
}
