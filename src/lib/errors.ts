export type ErrorCode =
  | 'STORAGE'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'HTTP'
  | 'VALIDATION'
  | 'EXECUTION'
  | 'UNKNOWN';

/** Application error with a machine-readable code and the original cause. */
export class AppError extends Error {
  readonly code: ErrorCode;
  override readonly cause?: unknown;

  constructor(message: string, code: ErrorCode = 'UNKNOWN', cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

/** Convert anything that was thrown into an AppError. */
export function toAppError(error: unknown, fallbackCode: ErrorCode = 'UNKNOWN'): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) return new AppError(error.message, fallbackCode, error);
  return new AppError(typeof error === 'string' ? error : 'Unexpected error', fallbackCode, error);
}

/** Safe, user-presentable message for any thrown value. */
export function getErrorMessage(error: unknown): string {
  return toAppError(error).message;
}
