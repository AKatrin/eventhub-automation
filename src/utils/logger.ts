import fs from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';
import winston, { format, transports, type Logger } from 'winston';
import { envConfig } from '../config/env.config';

const logDirectory = path.resolve(process.cwd(), envConfig.logging.directory);
fs.mkdirSync(logDirectory, { recursive: true });

const dateStamp = new Date().toISOString().slice(0, 10);
const combinedLogFile = path.join(logDirectory, `eventhub-${dateStamp}.log`);
const errorLogFile = path.join(logDirectory, `eventhub-error-${dateStamp}.log`);

const SENSITIVE_KEY_PATTERN = /password|passwd|token|authorization|secret|api[-_]?key/i;
const FULLY_MASKED_KEY_PATTERN = /password|passwd|secret|api[-_]?key/i;

/**
 * Recursively masks credentials before anything reaches the console, the log
 * files or the HTML/Allure report attachments.
 */
export function maskSensitiveData(value: unknown, key = ''): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (key && SENSITIVE_KEY_PATTERN.test(key)) {
    if (FULLY_MASKED_KEY_PATTERN.test(key)) {
      return '***';
    }

    if (typeof value === 'string') {
      return value.length <= 12 ? '***' : `${value.slice(0, 12)}...`;
    }

    return '***';
  }

  if (Array.isArray(value)) {
    return value.map((item) => maskSensitiveData(item));
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([entryKey, entryValue]) => [
        entryKey,
        maskSensitiveData(entryValue, entryKey),
      ]),
    );
  }

  return value;
}

function stringifyMetadata(metadata: Record<string, unknown>): string {
  const masked = maskSensitiveData(metadata) as Record<string, unknown>;
  const entries = Object.entries(masked).filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    return '';
  }

  return ` ${JSON.stringify(Object.fromEntries(entries))}`;
}

const plainTextFormat = format.printf((info) => {
  const { timestamp, level, message, stack, ...metadata } = info as Record<string, unknown>;
  const stackTrace = typeof stack === 'string' ? `\n${stack}` : '';

  return `${String(timestamp)} ${String(level).toUpperCase().padEnd(5)} ${String(message)}${stackTrace}${stringifyMetadata(metadata)}`;
});

const consoleFormat = format.combine(
  format.colorize({ level: true }),
  plainTextFormat,
);

const baseFormat = format.combine(
  format.timestamp({ format: () => new Date().toISOString() }),
  format.errors({ stack: true }),
  format.splat(),
);

export const logger: Logger = winston.createLogger({
  level: envConfig.logging.level,
  levels: winston.config.npm.levels,
  format: baseFormat,
  defaultMeta: {
    environment: envConfig.testEnvironment,
  },
  transports: [
    new transports.Console({
      level: envConfig.logging.level,
      format: consoleFormat,
      handleExceptions: false,
    }),
    new transports.File({
      filename: combinedLogFile,
      level: envConfig.logging.level,
      format: plainTextFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 14,
      tailable: true,
    }),
    new transports.File({
      filename: errorLogFile,
      level: 'error',
      format: plainTextFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 14,
      tailable: true,
    }),
  ],
  exitOnError: false,
});

logger.debug('Winston logger initialised', {
  level: envConfig.logging.level,
  logDirectory,
  combinedLogFile,
  errorLogFile,
});

export interface LogCapture {
  transport: InstanceType<typeof transports.Stream>;
  getLines: () => string[];
}

/**
 * Creates an in-memory Winston transport. The test fixture attaches the captured
 * lines to the HTML/Allure report so the report contains the full execution log.
 */
export function createLogCapture(): LogCapture {
  const lines: string[] = [];

  const stream = new Writable({
    write(chunk: unknown, _encoding, callback) {
      lines.push(String(chunk).trimEnd());
      callback();
    },
  });

  const transport = new transports.Stream({
    stream,
    level: envConfig.logging.level,
    format: plainTextFormat,
  });

  return {
    transport,
    getLines: () => [...lines],
  };
}

/** Logs a business-level test step with a consistent, greppable prefix. */
export function logStep(step: string, details?: Record<string, unknown>): void {
  logger.info(`STEP | ${step}`, details);
}

export type { Logger };
