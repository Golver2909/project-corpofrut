import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LOG_EVENTS, LogContractPayload } from '../contracts/log.contract';

@Injectable()
export class LogsClientService {
  private readonly logger = new Logger(LogsClientService.name);

  constructor(@Inject('LOGS_SERVICE') private readonly client: ClientProxy) {}

  /** Nunca deja que un fallo al loguear tumbe la app — solo avisa por consola */
  send(payload: LogContractPayload) {
    try {
      this.client.emit(LOG_EVENTS.CREATE, payload);
    } catch (err) {
      this.logger.warn(`No se pudo enviar el log a ms-logs: ${(err as Error).message}`);
    }
  }
}