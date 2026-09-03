import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message = typeof response === 'string' ? response : (response as any).message;

      return throwError(() => new RpcException({ statusCode: status, message }));
    }

    if (exception instanceof RpcException) {
      return throwError(() => exception);
    }

    return throwError(() =>
      new RpcException({ statusCode: 500, message: 'Error interno del servidor' }),
    );
  }
}