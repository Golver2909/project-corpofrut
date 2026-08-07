import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { LogsClientService } from '../../logs-client/logs-client.service';
import { LogType } from '../../contracts/log.contract';

/**
 * Filtro global: cualquier excepción no controlada (errores de Prisma,
 * bugs, timeouts, etc.) se loguea en consola Y se le reporta a ms-logs.
 * Los errores "esperados" del negocio (ej. NotFoundException, 404) NO se
 * reportan como error real — son parte del flujo normal, no bugs.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly logsClient: LogsClientService) {}

  catch(exception: unknown, host: ArgumentsHost): Observable<unknown> | void {
    const error = exception instanceof Error ? exception : new Error(String(exception));
    const isExpectedClientError =
      exception instanceof HttpException && exception.getStatus() < 500;

    this.logger.error(error.message, error.stack);

    if (!isExpectedClientError) {
      this.logsClient.send({
        type: LogType.Error,
        description: error.message,
        service: 'notificaciones',
        metadata: {
          stack: error.stack,
          contextType: host.getType(),
        },
      });
    }

    if (host.getType() === 'rpc') {
      return throwError(() => exception);
    }

    throw exception;
  }
}