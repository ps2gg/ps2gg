import { Logger, createLogger, format, transports } from 'winston'
import { LoggerService } from '@nestjs/common'

const { combine, colorize, timestamp, align, printf } = format
const production = process.env.NODE_ENV === 'production'

export function createServiceLogger(service: string): Logger {
  return createLogger(getLoggerOptions(service))
}

function getLoggerOptions(service) {
  return {
    level: 'info',
    format: format.combine(format.timestamp(), format.json()),
    defaultMeta: { service },
    transports: production ? getProductionTransports() : getDevelopmentTransports(),
  }
}

function getProductionTransports() {
  return [
    new transports.File({ filename: `${process.cwd()}/error.log`, level: 'error' }),
    new transports.File({ filename: `${process.cwd()}/combined.log` }),
  ]
}

function getDevelopmentTransports() {
  return [
    new transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
        format((info) => {
          info.level = info.level.toUpperCase()
          return info
        })(),
        align(),
        colorize({ all: true }),
        printf((info) => `[${info.timestamp}] ${info.level} ${info.message} (${info.service})`)
      ),
    }),
  ]
}

export class WinstonLoggerService implements LoggerService {
  private _logger: Logger

  public constructor(service: string) {
    this._logger = createServiceLogger(service)

    console.log = (message: string, params?: any) => {
      this._logger.debug(message, params)
    }
  }

  public log(message: string): void {
    this._logger.info(message)
  }
  public error(message: string, trace: string): void {
    this._logger.error(message, trace)
  }
  public warn(message: string): void {
    this._logger.warning(message)
  }
  public debug(message: string): void {
    this._logger.debug(message)
  }
  public verbose(message: string): void {
    this._logger.verbose(message)
  }
}
