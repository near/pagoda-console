import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import type { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: Logger) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        tap(() => {
          const { path, method } = context.switchToHttp().getRequest<Request>();
          const { statusCode } = context.switchToHttp().getResponse<Response>();
          this.logger.log({
            type: 'request',
            data: {
              path,
              method,
              statusCode,
            },
          });
        }),
      )
      .pipe(
        catchError((err: HttpException | Error) =>
          throwError(() => {
            const req = context.switchToHttp().getRequest();
            const { path, method, params, query, body } = req;
            this.logger.error({
              type: 'request-failure',
              data: {
                cause: err.message,
                stack: err.stack,
                path,
                method,
                params,
                query,
                body,
                statusCode:
                  'getStatus' in err ? (err as HttpException).getStatus() : 500, // non-HTTP errors won't have a status code set, nestjs will return a 500 in this case: https://docs.nestjs.com/exception-filters
              },
            });
            return err;
          }),
        ),
      );
  }
}
