import { env } from '@/config/env';
import { AppError } from '@/lib/errors';

/** Thrown when the server answers with a non-2xx status. */
export class HttpError extends AppError {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message, 'HTTP');
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  /** Abort the request from the caller (e.g. component unmount). */
  signal?: AbortSignal;
  timeoutMs?: number;
}

function parseBody(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function messageFrom(body: unknown): string | undefined {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return undefined;
}

/**
 * JSON request helper with timeout, cancellation and normalized errors.
 * Throws HttpError (bad status) or AppError (NETWORK / TIMEOUT); never a raw TypeError.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers, signal, timeoutMs = env.apiTimeoutMs } = options;

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort, { once: true });

  try {
    const response = await fetch(`${env.apiBaseUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    const data = text ? parseBody(text) : undefined;

    if (!response.ok) {
      throw new HttpError(
        response.status,
        messageFrom(data) ?? `Request failed with status ${response.status}`,
        data,
      );
    }
    return data as T;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (controller.signal.aborted) {
      throw new AppError(timedOut ? 'Request timed out' : 'Request cancelled', 'TIMEOUT', error);
    }
    throw new AppError('Network error: could not reach the server', 'NETWORK', error);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

type BodylessOptions = Omit<RequestOptions, 'method' | 'body'>;
type BodyOptions = Omit<RequestOptions, 'method'>;

export const http = {
  get: <T>(path: string, options?: BodylessOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: BodyOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: BodyOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: BodyOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: BodylessOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
