import { TOKEN_KEY } from './constants';

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const getCookie = (name) => {
  if (typeof document === 'undefined') return null;

  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(prefix));

  if (!match) return null;
  return decodeURIComponent(match.slice(prefix.length));
};

export const setCookie = (name, value, { maxAge = DEFAULT_MAX_AGE_SECONDS } = {}) => {
  if (typeof document === 'undefined') return;

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Strict${secure}`;
};

export const removeCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Strict`;
};

export const getAuthToken = () => getCookie(TOKEN_KEY);

export const setAuthToken = (token) => {
  setCookie(TOKEN_KEY, token);
  // Clear any legacy localStorage token from earlier builds.
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
};

export const clearAuthToken = () => {
  removeCookie(TOKEN_KEY);
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
};
