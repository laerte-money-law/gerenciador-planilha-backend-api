import { BaseAppError } from "../base.error";
import { ErrorMessage } from "../error-messages.enum";
import { HttpStatus } from "@nestjs/common";

export class InternalConfigAppError extends BaseAppError {
    constructor(errorMessage: ErrorMessage) {
        super(errorMessage);
        this.status = HttpStatus.INTERNAL_SERVER_ERROR;
        this.name = "InternalConfigAppError";
    }
}
