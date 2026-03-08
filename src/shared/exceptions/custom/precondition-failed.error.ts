import { HttpStatus } from "@nestjs/common";
import { ErrorMessage } from "../error-messages.enum";
import { BaseAppError } from "../base.error";

export class PreconditionFailedAppError extends BaseAppError {
    constructor(errorMessage: ErrorMessage) {
        super(errorMessage);
        this.status = HttpStatus.PRECONDITION_FAILED;
        this.name = "PreconditionFailedAppError";
    }
}
