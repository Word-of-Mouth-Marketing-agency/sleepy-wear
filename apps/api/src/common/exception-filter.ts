import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("Exception");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any).requestId;

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    const logBody = {
      requestId,
      method: request.method,
      path: request.path,
      status,
      ...(status >= 500 && {
        error:
          exception instanceof Error
            ? exception.message
            : String(exception),
      }),
    };

    if (status >= 500) {
      this.logger.error(JSON.stringify(logBody));
    } else {
      this.logger.warn(JSON.stringify(logBody));
    }

    const body =
      typeof message === "string"
        ? { statusCode: status, message }
        : { statusCode: status, ...(message as Record<string, unknown>) };

    response.status(status).json(body);
  }
}
