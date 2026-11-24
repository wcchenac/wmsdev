import type { AxiosRequestConfig } from 'axios';

export const DUPLICATE_REQUEST_MESSAGE = '請求處理中，請勿重複送出';

const WRITE_METHODS = new Set(['post', 'patch', 'put', 'delete']);

/**
 * Thrown when an identical mutating API request is already in flight.
 */
export class DuplicateRequestError extends Error {
  readonly isDuplicateRequest = true;

  constructor(message = DUPLICATE_REQUEST_MESSAGE) {
    super(message);
    this.name = 'DuplicateRequestError';
  }
}

export function isDuplicateRequest(error: unknown): boolean {
  if (error instanceof DuplicateRequestError) {
    return true;
  }
  return (
    typeof error === 'object' &&
    error !== null &&
    'isDuplicateRequest' in error &&
    (error as { isDuplicateRequest?: unknown }).isDuplicateRequest === true
  );
}

function stableSerialize(value: unknown, seen = new WeakSet<object>()): string {
  if (value === undefined) return 'undefined';
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (typeof FormData !== 'undefined' && value instanceof FormData) {
    const entries: string[] = [];
    value.forEach((entryValue, key) => {
      if (typeof File !== 'undefined' && entryValue instanceof File) {
        entries.push(
          `${key}=File(${entryValue.name}:${entryValue.size}:${entryValue.lastModified})`
        );
      } else {
        entries.push(`${key}=${String(entryValue)}`);
      }
    });
    return `FormData(${entries.join('&')})`;
  }
  if (typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams) {
    return `URLSearchParams(${value.toString()})`;
  }
  if (value instanceof Date) {
    return `Date(${value.toISOString()})`;
  }
  if (seen.has(value)) {
    return '[Circular]';
  }
  seen.add(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item, seen)).join(',')}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(obj[key], seen)}`)
    .join(',')}}`;
}

function normalizeRequestPath(baseURL: string | undefined, url: string | undefined): string {
  const base = (baseURL ?? '').replace(/\/+$/, '');
  const path = (url ?? '').replace(/^\/+/, '');
  if (!path) return base || '/';
  if (/^https?:\/\//i.test(url ?? '')) {
    return url as string;
  }
  return base ? `${base}/${path}` : `/${path}`;
}

/**
 * Builds a deterministic key for write requests (`POST`/`PATCH`/`PUT`/`DELETE`), or returns
 * `null` for non-mutating requests so reads are never blocked.
 */
export function buildWriteRequestKey(config: AxiosRequestConfig): string | null {
  const method = (config.method ?? 'get').toLowerCase();
  if (!WRITE_METHODS.has(method)) {
    return null;
  }
  const normalizedUrl = normalizeRequestPath(config.baseURL, config.url);
  const serializedParams =
    config.params !== undefined ? stableSerialize(config.params) : '';
  const serializedData =
    config.data !== undefined ? stableSerialize(config.data) : '';
  return `${method.toUpperCase()} ${normalizedUrl}?${serializedParams}#${serializedData}`;
}
