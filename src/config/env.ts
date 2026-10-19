/**
 * Typed, validated access to build-time environment variables.
 *
 * Only variables prefixed with `VITE_` are exposed to the browser by Vite.
 * Never put secrets (API keys, tokens) in a `VITE_` variable: they would be
 * shipped to every visitor. Secrets belong on a server behind the API.
 */
// `?? {}` keeps the module importable outside Vite (e.g. Node-based tests).
const raw: Partial<ImportMetaEnv> = import.meta.env ?? {};

const toPositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  mode: raw.MODE ?? 'development',
  isDev: Boolean(raw.DEV),
  isProd: Boolean(raw.PROD),
  apiBaseUrl: (raw.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''),
  apiTimeoutMs: toPositiveInt(raw.VITE_API_TIMEOUT_MS, 10_000),
  enableRemoteApi: raw.VITE_ENABLE_REMOTE_API === 'true',
  appUrl: raw.VITE_APP_URL ?? '',
} as const;
