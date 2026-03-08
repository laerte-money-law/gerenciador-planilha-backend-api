import { HttpStatus } from "@nestjs/common";
import { ErrorMessage } from './error-messages.enum';

export class BaseAppError extends Error {
    code: number;
    status: number;

    constructor(errorMessage: ErrorMessage) {
        super(errorMessage.message);
        this.code = errorMessage.code;
        this.status = HttpStatus.INTERNAL_SERVER_ERROR;
        this.name = "BaseAppError";
    }
}
