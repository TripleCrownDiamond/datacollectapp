import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
}

const STATUS_CODE_MAP: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const requestId = uuidv4();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = STATUS_CODE_MAP[status] || 'INTERNAL_ERROR';
      message = exception.message;

      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        if (resp.message) {
          if (Array.isArray(resp.message)) {
            // Validation pipe errors come as string arrays
            details = resp.message;
            message = resp.message[0] as string || 'Validation failed';
          } else if (typeof resp.message === 'string') {
            message = resp.message;
          }
        }
        // Structured validation details (e.g. form schema publication errors)
        if (resp.details !== undefined) {
          details = resp.details;
        }
        if (resp.error && typeof resp.error === 'string') {
          code = resp.error.toUpperCase().replace(/\s+/g, '_');
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log server errors
    if (status >= 500) {
      console.error(`[${requestId}] Internal error:`, exception instanceof Error ? exception.stack : exception);
    }

    const body: ErrorResponse = {
      error: { code, message, details, requestId },
    };

    response.status(status).json(body);
  }
}
