import { Injectable, LoggerService } from '@nestjs/common';
import { pino } from 'pino';
import type { Logger as PinoLogger } from 'pino';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/validate';

@Injectable()
export class Logger implements LoggerService {
  private pino: PinoLogger;
  constructor(private config: ConfigService<AppConfig>) {
    this.pino = pino({
      formatters: {
        level(label) {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      transport:
        this.config.get('deployEnv', { infer: true }) === 'LOCAL'
          ? {
              target: 'pino-pretty',
            }
          : undefined,
    });
  }
  log(message: any, ..._optionalParams: any[]) {
    this.pino.info(message);
  }
  error(message: any, ..._optionalParams: any[]) {
    this.pino.error(message);
  }
  warn(message: any, ..._optionalParams: any[]) {
    this.pino.warn(message);
  }
  debug?(message: any, ..._optionalParams: any[]) {
    this.pino.debug(message);
  }
  verbose?(message: any, ..._optionalParams: any[]) {
    this.pino.trace(message);
  }
}
