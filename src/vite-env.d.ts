/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API, e.g. https://api.example.com/v1 (empty = same origin). */
  readonly VITE_API_BASE_URL?: string;
  /** Request timeout in milliseconds. */
  readonly VITE_API_TIMEOUT_MS?: string;
  /** "true" switches persistence from localStorage to the remote API. */
  readonly VITE_ENABLE_REMOTE_API?: string;
  /** Public URL where the app is hosted. */
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
