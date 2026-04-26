import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let detail: unknown[] | undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as Record<string, unknown>;
      if (Array.isArray(resp.message)) {
        message = 'Error de validación';
        detail = resp.message as unknown[];
      } else {
        message = (resp.message as string) ?? exception.message;
      }
    } else {
      message = exception.message;
    }

    const errorBody: Record<string, unknown> = {
      success: false,
      statusCode,
      message,
      error: HttpStatus[statusCode] ?? 'Error',
    };

    if (detail !== undefined) {
      errorBody.detail = detail;
    }

    response.status(statusCode).json(errorBody);
  }
}
