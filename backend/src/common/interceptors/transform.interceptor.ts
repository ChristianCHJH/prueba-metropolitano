import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PaginatedData<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StandardResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const statusCode: number = response.statusCode;

    return next.handle().pipe(
      map((result) => {
        if (
          result &&
          typeof result === 'object' &&
          'data' in result &&
          'meta' in result &&
          result.meta &&
          typeof result.meta === 'object' &&
          'total' in result.meta
        ) {
          const paginated = result as PaginatedData<unknown>;
          return {
            success: true,
            statusCode,
            message: 'Listado obtenido',
            data: paginated.data,
            meta: paginated.meta,
          } as unknown as StandardResponse<T>;
        }

        return {
          success: true,
          statusCode,
          message: 'Operación exitosa',
          data: result,
        };
      }),
    );
  }
}
