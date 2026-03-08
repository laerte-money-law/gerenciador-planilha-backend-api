import { HttpStatus } from "@nestjs/common";
import { ErrorMessage } from "../error-messages.enum";
import { BaseAppError } from "../base.error";

export class UnauthorizedAppError extends BaseAppError {
    constructor(errorMessage: ErrorMessage) {
        super(errorMessage);
        this.status = HttpStatus.UNAUTHORIZED;
        this.name = "UnauthorizedAppError";
    }
}
