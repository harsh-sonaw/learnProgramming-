import { env } from '@/config/env';

type Level = 'debug' | 'info' | 'warn' | 'error';

const WEIGHT: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN_LEVEL: Level = env.isProd ? 'warn' : 'debug';

function emit(level: Level, scope: string, message: string, meta?: unknown): void {
  if (WEIGHT[level] < WEIGHT[MIN_LEVEL]) return;
  const line = `[${scope}] ${message}`;
  // Single place to plug in a remote error reporter (Sentry, etc.) later.
  if (meta === undefined) console[level](line);
  else console[level](line, meta);
}

export interface Logger {
  debug: (message: string, meta?: unknown) => void;
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
}

/** Create a logger whose lines are prefixed with `scope`, e.g. `createLogger('storage')`. */
export function createLogger(scope: string): Logger {
  return {
    debug: (m, meta) => emit('debug', scope, m, meta),
    info: (m, meta) => emit('info', scope, m, meta),
    warn: (m, meta) => emit('warn', scope, m, meta),
    error: (m, meta) => emit('error', scope, m, meta),
  };
}
