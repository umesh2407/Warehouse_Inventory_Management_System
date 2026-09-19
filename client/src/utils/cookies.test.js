import { beforeEach, describe, expect, it } from 'vitest';
import { clearAuthToken, getAuthToken, getCookie, setAuthToken } from './cookies';
import { TOKEN_KEY } from './constants';

describe('cookies auth helpers', () => {
  beforeEach(() => {
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0]?.trim();
      if (name) {
        document.cookie = `${name}=; Path=/; Max-Age=0`;
      }
    });
    localStorage.clear();
  });

  it('stores and reads the auth token from cookies', () => {
    setAuthToken('test-jwt');
    expect(getAuthToken()).toBe('test-jwt');
    expect(getCookie(TOKEN_KEY)).toBe('test-jwt');
  });

  it('clears the auth token cookie', () => {
    setAuthToken('test-jwt');
    clearAuthToken();
    expect(getAuthToken()).toBeNull();
  });

  it('removes legacy localStorage token when setting cookie', () => {
    localStorage.setItem(TOKEN_KEY, 'old-token');
    setAuthToken('new-token');
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(getAuthToken()).toBe('new-token');
  });
});
