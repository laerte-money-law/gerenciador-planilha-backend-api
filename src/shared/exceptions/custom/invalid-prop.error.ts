import { HttpStatus } from "@nestjs/common";
import { BaseAppError } from "../base.error";
import { ErrorMessage } from '../error-messages.enum';

export class InvalidPropAppError extends BaseAppError {
    constructor(errorMessage: ErrorMessage) {
        super(errorMessage);
        this.status = HttpStatus.BAD_REQUEST;
        this.name = "InvalidPropAppError";
    }
}
