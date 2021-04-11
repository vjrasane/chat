import {
  isNil, repeat, noop, toUpper, mergeAll
} from 'lodash/fp';

enum Styles {
    ANSI_NORMAL = '\x1B[0;39m',
    ANSI_BOLD = '\x1B[1;39m',
    ANSI_BLACK = '\x1B[0;30m',
    ANSI_RED = '\x1B[0;31m',
    ANSI_RED_BOLD = '\x1B[1;31m',
    ANSI_GREEN = '\x1B[0;32m',
    ANSI_GREEN_BOLD = '\x1B[1;32m',
    ANSI_DKGREEN = '\x1B[0;32m',
    ANSI_YELLOW = '\x1B[0;33m',
    ANSI_YELLOW_BOLD = '\x1B[1;33m',
    ANSI_BLUE = '\x1B[0;34m',
    ANSI_BLUE_BOLD = '\x1B[1;34m',
    ANSI_MAGENTA = '\x1B[0;35m',
    ANSI_MAGENTA_BOLD = '\x1B[1;35m',
    ANSI_DKMAGENTA = '\x1B[0;35m',
    ANSI_CYAN = '\x1B[0;36m',
    ANSI_CYAN_BOLD = '\x1B[1;36m',
    ANSI_GREY = '\x1B[0;37m',
    ANSI_WHITE = '\x1B[1;37m',
    ANSI_OK = '\x1B[1;32m',
    ANSI_WARN = '\x1B[1;33m',
    ANSI_ERROR = '\x1B[1;31m'
}

enum LogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    TRACE = 5
}

const getEnvLogLevel = (): LogLevel => {
  const { LOG_LEVEL, NODE_ENV, VERBOSE_TEST } = process.env;
  if (!isNil(LOG_LEVEL) && toUpper(LOG_LEVEL) in LogLevel) {
    return LogLevel[
            /* we have to tell the typescript compiler that
            we know LOG_LEVEL is a valid enum key */
            toUpper(LOG_LEVEL) as keyof typeof LogLevel
    ];
  }

  switch (NODE_ENV) {
    case 'development':
      return LogLevel.DEBUG;
    case 'production':
      return LogLevel.INFO;
    case 'test':
      return VERBOSE_TEST
        ? LogLevel.DEBUG
        : LogLevel.NONE;
    default:
      return LogLevel.INFO;
  }
};

type LoggerOptions = {
    indent?: number,
    level?: LogLevel,
    output?: (msg: string) => void;
};

const defaultLoggerOpts: LoggerOptions = {
  indent: 0,
  /* eslint-disable-next-line no-console */
  output: console.log
};

type LogOptions = {
    indent?: number
};

const defaultLogOpts: LogOptions = {
  indent: 0
};

type LogFunction = (msg: string, logOpts?: LogOptions) => void;

type Logger = {
    log: (level: LogLevel, msg: string, logOpts?: LogOptions) => void,
    warn: LogFunction,
    weakWarn: LogFunction,
    error: LogFunction,
    weakError: LogFunction,
    highlight: LogFunction,
    info: LogFunction,
    debug: LogFunction,
    trace: LogFunction
};

const createLogger = (modulePrefix = '', loggerOpts: LoggerOptions = {}): Logger => {
  const { level: loggerLevel, indent: loggerIndent, output }: LoggerOptions = mergeAll(
    [{}, defaultLoggerOpts, loggerOpts]
  );
  const logLevel: LogLevel = !isNil(loggerLevel)
    ? loggerLevel
    : getEnvLogLevel();

  const getDecoratedLog = (style: string = Styles.ANSI_NORMAL): LogFunction => (msg: string, logOpts: LogOptions = {}) => {
    const { indent: logIndent }: LogOptions = mergeAll(
      [{}, defaultLogOpts, logOpts]
    );
    const metadata = [new Date().toISOString(), modulePrefix].join(' ');
    const indent = repeat(
      (loggerIndent || 0) + (logIndent || 0), ' '
    );
    const indented = `${metadata}: ${indent}${msg}`;
    const stylized = `${style}${indented}${Styles.ANSI_NORMAL}`;
    if (!isNil(output)) output(stylized);
  };

  const getLog = (
    level: LogLevel,
    style: string = Styles.ANSI_NORMAL
  ): LogFunction => (level <= logLevel ? getDecoratedLog(style) : noop);

  const warn = getLog(LogLevel.WARN, Styles.ANSI_WARN);
  const weakWarn = getLog(LogLevel.WARN, Styles.ANSI_YELLOW);
  const error = getLog(LogLevel.ERROR, Styles.ANSI_ERROR);
  const weakError = getLog(LogLevel.ERROR, Styles.ANSI_RED);
  const highlight = getLog(LogLevel.INFO, Styles.ANSI_BOLD);
  const info = getLog(LogLevel.INFO, Styles.ANSI_WHITE);
  const debug = getLog(LogLevel.DEBUG, Styles.ANSI_GREY);
  const trace = getLog(LogLevel.TRACE, Styles.ANSI_GREY);
  const log = (level: LogLevel, msg: string, logOpts?: LogOptions) => {
    switch (level) {
      case LogLevel.WARN:
        return warn(msg, logOpts);
      case LogLevel.ERROR:
        return error(msg, logOpts);
      case LogLevel.TRACE:
        return trace(msg, logOpts);
      case LogLevel.DEBUG:
        return debug(msg, logOpts);
      case LogLevel.INFO:
      default:
        return info(msg, logOpts);
    }
  };

  return {
    log,
    warn,
    weakWarn,
    error,
    weakError,
    highlight,
    info,
    debug,
    trace
  };
};

export {
  createLogger, Logger, LogLevel, Styles
};
