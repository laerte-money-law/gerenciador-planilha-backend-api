import { Injectable } from '@nestjs/common';
import { UserService } from '../../users/service/user.service';

@Injectable()
export class RedefinePasswordUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(userId: number, password: string): Promise<void> {
    await this.userService.updateUser(userId, { password, shouldRedefinePassword: false });
  }
}
