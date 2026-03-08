import { HttpStatus } from "@nestjs/common";
import { BaseAppError } from "../base.error";
import { ErrorMessage } from '../error-messages.enum';

export class NotFoundAppError extends BaseAppError {
    constructor(errorMessage: ErrorMessage) {
        super(errorMessage);
        this.status = HttpStatus.NOT_FOUND;
        this.name = "NotFoundAppError";
    }
}
