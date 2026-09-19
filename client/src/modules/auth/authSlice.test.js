import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/cookies', () => ({
  getAuthToken: vi.fn(() => null),
  setAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
}));

import { setAuthToken } from '../../utils/cookies';
import authReducer, { clearAuthError, login } from './authSlice';

describe('authSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('clears auth error', () => {
    const state = authReducer(
      { user: null, token: null, status: 'failed', bootstrapStatus: 'idle', error: 'Nope' },
      clearAuthError()
    );
    expect(state.error).toBeNull();
  });

  it('stores user and token on login fulfilled', () => {
    const payload = {
      user: { id: '1', name: 'Admin', role: 'ADMIN' },
      token: 'jwt-token',
    };
    const state = authReducer(undefined, {
      type: login.fulfilled.type,
      payload,
    });
    expect(state.user).toEqual(payload.user);
    expect(state.token).toBe('jwt-token');
    expect(state.status).toBe('succeeded');
    expect(setAuthToken).toHaveBeenCalledWith('jwt-token');
  });
});
