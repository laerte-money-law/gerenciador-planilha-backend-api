import { Team } from "src/team/model/team.entity"

export class CreateUserResponseDto {
    id: number
    name: string
    email: string
    team: {
        id: number;
        name: string;
    };
}