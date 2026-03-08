import { HttpStatus } from "@nestjs/common";
import { ErrorMessage } from "../error-messages.enum";
import { BaseAppError } from "../base.error";

export class ExternalIntegrationAppError extends BaseAppError {
    constructor(errorMessage: ErrorMessage) {
        super(errorMessage);
        this.status = HttpStatus.INTERNAL_SERVER_ERROR;
        this.name = "ExternalIntegrationAppError";
    }
}
