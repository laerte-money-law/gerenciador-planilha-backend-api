import { Team } from "src/team/model/team.entity"

export class UserResponseDto {
    id: number
    name: string
    email: string
    teamName: Team
    role: string
}