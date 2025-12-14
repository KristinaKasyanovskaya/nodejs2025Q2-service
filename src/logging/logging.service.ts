import { Injectable, LogLevel } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const NEST_LOG_LEVELS: LogLevel[] = [
  'error',
  'warn',
  'log',
  'debug',
  'verbose',
];

@Injectable()
export class LoggingService {
  private logLevel: LogLevel;
  private logFile: string;
  private errorLogFile: string;
  private maxFileSizeKB: number;
  private logDir: string;
  private enabledLogLevels: LogLevel[];

  constructor() {
    this.maxFileSizeKB = parseInt(
      process.env.LOG_MAX_FILE_SIZE_KB || '100',
      10,
    );
    this.logDir = process.env.LOG_DIR || 'logs';
    this.logFile = process.env.LOG_FILE || 'app.log';
    this.errorLogFile = process.env.ERROR_LOG_FILE || 'error.log';
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    const logLevelEnv = process.env.LOG_LEVEL?.toLowerCase() || 'log';
    this.setLogLevel(logLevelEnv);
  }

  private setLogLevel(level: string | number): void {
    let levelIndex: number;
    if (typeof level === 'string' && /^\d+$/.test(level)) {
      levelIndex = parseInt(level, 10);
    } else if (typeof level === 'number') {
      levelIndex = level;
      const levelMap: Record<string, number> = {
        error: 0,
        warn: 1,
        log: 2,
        debug: 3,
        verbose: 4,
      };
      levelIndex = levelMap[level] ?? 2;
    }

    levelIndex = Math.max(0, Math.min(4, levelIndex));

    this.logLevel = NEST_LOG_LEVELS[levelIndex];
    this.enabledLogLevels = NEST_LOG_LEVELS.slice(0, levelIndex + 1);
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabledLogLevels.includes(level);
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    const levelStr = level.toUpperCase().padEnd(7);
    return `${timestamp} [${levelStr}] ${contextStr} ${message}\n`;
  }

  private writeLog(message: string, level: LogLevel): void {
    const filePath = path.join(this.logDir, this.logFile);
    this.rotateLogIfNeeded(filePath);
    fs.appendFileSync(filePath, message, 'utf8');
    if (level === 'error') {
      const errorFilePath = path.join(this.logDir, this.errorLogFile);
      this.rotateLogIfNeeded(errorFilePath);
      fs.appendFileSync(errorFilePath, message, 'utf8');
    }
  }

  private rotateLogIfNeeded(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      return;
    }
    const stats = fs.statSync(filePath);
    const fileSizeKB = stats.size / 1024;

    if (fileSizeKB >= this.maxFileSizeKB) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const baseName = path.basename(filePath, path.extname(filePath));
      const ext = path.extname(filePath);
      const rotatedFileName = `${baseName}-${timestamp}${ext}`;
      const rotatedFilePath = path.join(
        path.dirname(filePath),
        rotatedFileName,
      );

      fs.renameSync(filePath, rotatedFilePath);

      const files = fs
        .readdirSync(path.dirname(filePath))
        .filter(
          (f) =>
            f.startsWith(baseName) &&
            f !== path.basename(filePath) &&
            f.endsWith(ext),
        )
        .map((f) => ({
          name: f,
          time: fs
            .statSync(path.join(path.dirname(filePath), f))
            .mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      files.slice(5).forEach((file) => {
        fs.unlinkSync(path.join(path.dirname(filePath), file.name));
      });
    }
  }

  error(message: string, context?: string): void {
    const level: LogLevel = 'error';
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(level, message, context);
      this.writeLog(formattedMessage, level);
    }
  }

  warn(message: string, context?: string): void {
    const level: LogLevel = 'warn';
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(level, message, context);
      this.writeLog(formattedMessage, level);
    }
  }

  log(message: string, context?: string): void {
    const level: LogLevel = 'log';
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(level, message, context);
      this.writeLog(formattedMessage, level);
    }
  }

  debug(message: string, context?: string): void {
    const level: LogLevel = 'debug';
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(level, message, context);
      this.writeLog(formattedMessage, level);
    }
  }

  verbose(message: string, context?: string): void {
    const level: LogLevel = 'verbose';
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(level, message, context);
      this.writeLog(formattedMessage, level);
    }
  }

  info(message: string, context?: string): void {
    this.log(message, context);
  }
}
