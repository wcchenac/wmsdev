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

function serializeBlobLike(value: Blob): string {
  if (typeof File !== 'undefined' && value instanceof File) {
    return `File(${encodeURIComponent(value.name)}:${value.size}:${value.lastModified}:${encodeURIComponent(value.type)})`;
  }
  return `Blob(${value.size}:${encodeURIComponent(value.type)})`;
}

function safeOwnKeys(obj: object): string[] {
  try {
    return Object.keys(obj).sort();
  } catch {
    return [];
  }
}

function hashBytes(bytes: Uint8Array): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i += 1) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

function stableSerialize(value: unknown, ancestors = new WeakSet<object>()): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'bigint') return `BigInt(${value.toString()})`;
  if (value === null || typeof value !== 'object') {
    try {
      return JSON.stringify(value) ?? String(value);
    } catch {
      return String(value);
    }
  }
  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return serializeBlobLike(value);
  }
  if (value instanceof ArrayBuffer) {
    return `ArrayBuffer(${value.byteLength}:${hashBytes(new Uint8Array(value))})`;
  }
  if (ArrayBuffer.isView(value)) {
    const viewBytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    return `${value.constructor?.name ?? 'ArrayBufferView'}(${value.byteLength}:${hashBytes(viewBytes)})`;
  }
  if (typeof FormData !== 'undefined' && value instanceof FormData) {
    const entries: string[] = [];
    value.forEach((entryValue, key) => {
      const encodedKey = encodeURIComponent(key);
      const serializedVal =
        typeof Blob !== 'undefined' && entryValue instanceof Blob
          ? serializeBlobLike(entryValue)
          : encodeURIComponent(String(entryValue));
      entries.push(`${encodedKey}=${serializedVal}`);
    });
    entries.sort();
    return `FormData(${entries.join('&')})`;
  }
  if (typeof URLSearchParams !== 'undefined' && value instanceof URLSearchParams) {
    const pairs = Array.from(value.entries())
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .sort();
    return `URLSearchParams(${pairs.join('&')})`;
  }
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isNaN(ms) ? 'Date(NaN)' : `Date(${value.toISOString()})`;
  }
  if (value instanceof RegExp) {
    return `RegExp(${value.source}/${value.flags})`;
  }
  if (ancestors.has(value)) {
    return '[Circular]';
  }
  ancestors.add(value);
  try {
    if (value instanceof Set) {
      return `Set(${Array.from(value, (item) => stableSerialize(item, ancestors)).sort().join(',')})`;
    }
    if (value instanceof Map) {
      const entries = Array.from(
        value.entries(),
        ([k, v]) => `${stableSerialize(k, ancestors)}=>${stableSerialize(v, ancestors)}`
      ).sort();
      return `Map(${entries.join(',')})`;
    }
    if (Array.isArray(value)) {
      return `[${value.map((item) => stableSerialize(item, ancestors)).join(',')}]`;
    }
    const obj = value as Record<string, unknown>;
    return `{${safeOwnKeys(obj)
      .map((key) => {
        let propVal: unknown;
        try {
          propVal = obj[key];
        } catch {
          propVal = '[Unreadable]';
        }
        return `${JSON.stringify(key)}:${stableSerialize(propVal, ancestors)}`;
      })
      .join(',')}}`;
  } finally {
    ancestors.delete(value);
  }
}

function collectQueryPairs(source: unknown): string[] | null {
  if (source === undefined || source === null) {
    return [];
  }
  if (typeof URLSearchParams !== 'undefined' && source instanceof URLSearchParams) {
    return Array.from(source.entries()).map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    );
  }
  if (
    typeof source === 'object' &&
    !Array.isArray(source) &&
    !(source instanceof Date) &&
    !(source instanceof RegExp) &&
    !(source instanceof Map) &&
    !(source instanceof Set)
  ) {
    const pairs: string[] = [];
    const obj = source as Record<string, unknown>;
    for (const key of safeOwnKeys(obj)) {
      const val = obj[key];
      if (val === undefined || val === null) {
        continue;
      }
      if (typeof val === 'object') {
        return null;
      }
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
    }
    return pairs;
  }
  return null;
}

function normalizeUrlAndQuery(
  baseURL: string | undefined,
  rawUrl: string | undefined,
  params: unknown
): { normalizedUrl: string; queryKey: string } {
  const withoutHash = (rawUrl ?? '').split('#', 1)[0];
  const qIndex = withoutHash.indexOf('?');
  const pathPart = qIndex === -1 ? withoutHash : withoutHash.slice(0, qIndex);
  const inlineQuery = qIndex === -1 ? '' : withoutHash.slice(qIndex + 1);

  let normalizedUrl: string;
  if (/^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(pathPart)) {
    normalizedUrl = pathPart;
  } else {
    const base = (baseURL ?? '').replace(/\/+$/, '');
    const path = pathPart.replace(/^\/+/, '');
    if (!path) {
      normalizedUrl = base || '/';
    } else {
      normalizedUrl = base ? `${base}/${path}` : `/${path}`;
    }
  }

  const inlinePairs = inlineQuery
    ? Array.from(new URLSearchParams(inlineQuery).entries()).map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
      )
    : [];

  const flatParamPairs = collectQueryPairs(params);
  if (flatParamPairs !== null) {
    const merged = [...inlinePairs, ...flatParamPairs].sort().join('&');
    return { normalizedUrl, queryKey: merged };
  }

  inlinePairs.sort();
  const extraParams = params !== undefined ? stableSerialize(params) : '';
  const queryKey = [inlinePairs.join('&'), extraParams].filter(Boolean).join('&');
  return { normalizedUrl, queryKey };
}

/**
 * Builds a deterministic key for write requests (`POST`/`PATCH`/`PUT`/`DELETE`), or returns
 * `null` for non-mutating requests so reads are never blocked.
 */
export function buildWriteRequestKey(
  config: AxiosRequestConfig,
  defaultMethod?: string
): string | null {
  const method = (config.method ?? defaultMethod ?? 'get').toLowerCase();
  if (!WRITE_METHODS.has(method)) {
    return null;
  }
  const { normalizedUrl, queryKey } = normalizeUrlAndQuery(
    config.baseURL,
    config.url,
    config.params
  );
  const serializedData =
    config.data !== undefined ? stableSerialize(config.data) : '';
  return `${method.toUpperCase()} ${normalizedUrl}?${queryKey}#${serializedData}`;
}
