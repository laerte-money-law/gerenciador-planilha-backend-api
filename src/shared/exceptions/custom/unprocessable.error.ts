import { HttpStatus } from "@nestjs/common";
import { ErrorMessage } from "../error-messages.enum";
import { BaseAppError } from "../base.error";

export class UnprocessableAppError extends BaseAppError {
    constructor(errorMessage: ErrorMessage) {
        super(errorMessage);
        this.status = HttpStatus.UNPROCESSABLE_ENTITY;
        this.name = "UnprocessableAppError";
    }
}
