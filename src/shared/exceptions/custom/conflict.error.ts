import { HttpStatus } from "@nestjs/common";
import { BaseAppError } from "../base.error";
import { ErrorMessage } from '../error-messages.enum';

export class ConflictAppError extends BaseAppError {
    constructor(errorMessage: ErrorMessage) {
        super(errorMessage);
        this.status = HttpStatus.CONFLICT;
        this.name = "ConflictAppError";
    }
}
