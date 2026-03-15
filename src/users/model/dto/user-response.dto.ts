import { ClientOutputDto } from "src/client/model/dto/client.ouput.dto";

export class UserResponseDto {
    id: number
    name: string
    email: string
    team: {
        id: number;
        name: string;
    }
    client: ClientOutputDto
    role: string
}