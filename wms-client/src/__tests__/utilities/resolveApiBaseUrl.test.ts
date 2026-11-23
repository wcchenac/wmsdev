import { resolveApiBaseUrl } from '../../utilities/API';

// The runtime config (Docker's /config.js) wins whenever it sets apiBaseUrl, even to "".
// An empty string means "same origin, let nginx proxy /api"; only a missing apiBaseUrl
// falls back to the URL baked in at build time (.env.production).

const BUILD_TIME_URL = 'http://10.0.0.1:8200';

describe('resolveApiBaseUrl', () => {
  test('runtime URL is used over the build-time URL', () => {
    expect(
      resolveApiBaseUrl({ apiBaseUrl: 'http://backend:8080' }, { REACT_APP_API_BASE_URL: BUILD_TIME_URL }),
    ).toBe('http://backend:8080');
  });

  test('runtime URL is trimmed', () => {
    expect(resolveApiBaseUrl({ apiBaseUrl: '  http://backend:8080 ' }, {})).toBe('http://backend:8080');
  });

  test('runtime apiBaseUrl set to "" means same origin, not the build-time URL', () => {
    expect(resolveApiBaseUrl({ apiBaseUrl: '' }, { REACT_APP_API_BASE_URL: BUILD_TIME_URL })).toBe('/');
    expect(resolveApiBaseUrl({ apiBaseUrl: '' }, { VITE_API_BASE_URL: BUILD_TIME_URL })).toBe('/');
  });

  test('runtime apiBaseUrl of only whitespace also means same origin', () => {
    expect(resolveApiBaseUrl({ apiBaseUrl: '   ' }, { REACT_APP_API_BASE_URL: BUILD_TIME_URL })).toBe('/');
  });

  test('runtime config without apiBaseUrl falls back to the build-time URL', () => {
    expect(resolveApiBaseUrl({}, { REACT_APP_API_BASE_URL: BUILD_TIME_URL })).toBe(BUILD_TIME_URL);
  });

  test('no runtime config at all falls back to the build-time URL', () => {
    expect(resolveApiBaseUrl(undefined, { REACT_APP_API_BASE_URL: BUILD_TIME_URL })).toBe(BUILD_TIME_URL);
  });

  test('VITE_API_BASE_URL is preferred over REACT_APP_API_BASE_URL', () => {
    expect(
      resolveApiBaseUrl(undefined, {
        VITE_API_BASE_URL: 'http://vite:1',
        REACT_APP_API_BASE_URL: 'http://cra:2',
      }),
    ).toBe('http://vite:1');
  });

  test('a blank VITE_API_BASE_URL does not hide REACT_APP_API_BASE_URL', () => {
    expect(resolveApiBaseUrl(undefined, { VITE_API_BASE_URL: '  ', REACT_APP_API_BASE_URL: BUILD_TIME_URL })).toBe(
      BUILD_TIME_URL,
    );
  });

  test('nothing set anywhere means same origin', () => {
    expect(resolveApiBaseUrl(undefined, {})).toBe('/');
    expect(resolveApiBaseUrl({}, { VITE_API_BASE_URL: '', REACT_APP_API_BASE_URL: '' })).toBe('/');
  });

  test('a non-string runtime apiBaseUrl counts as not set', () => {
    const malformed = { apiBaseUrl: null } as unknown as { apiBaseUrl?: string };
    expect(resolveApiBaseUrl(malformed, { REACT_APP_API_BASE_URL: BUILD_TIME_URL })).toBe(BUILD_TIME_URL);
  });
});
