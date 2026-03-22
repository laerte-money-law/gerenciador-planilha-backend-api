export class UserLoggedDto {
  sub: number;
  id: number;
  userId: number;
  email: string;
  teamId?: number;
  clientId?: number;
  role: string;
  shouldRedefinePassword: boolean;
}
