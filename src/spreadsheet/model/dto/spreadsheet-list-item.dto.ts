import { TeamDto } from "src/team/model/dto/teamDto";

export class SpreadsheetListItemDto {
  id: string;
  name: string;
  team: TeamDto;
  service: string;
  createdAt: Date;
}
