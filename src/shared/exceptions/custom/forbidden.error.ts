import { HttpStatus } from "@nestjs/common";
import { ErrorMessage } from "../error-messages.enum";
import { BaseAppError } from "../base.error";

export class ForbiddenAppError extends BaseAppError {
    constructor(errorMessage: ErrorMessage) {
        super(errorMessage);
        this.status = HttpStatus.FORBIDDEN;
        this.name = "ForbiddenAppError";
    }
}
