import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../../users/service/user.service';
import { UserLoggedDto } from '../user-logged.dto';

@Injectable()
export class RedefinePasswordUseCase {
  private readonly logger = new Logger(RedefinePasswordUseCase.name);

  constructor(private readonly userService: UserService) {}

  async execute(user: UserLoggedDto, password: string): Promise<void> {
    this.logger.log('Redefinindo senha do usuario: ', user.email);
    await this.userService.updateUser(user.userId, {
      password,
      shouldRedefinePassword: false,
    });
  }
}
