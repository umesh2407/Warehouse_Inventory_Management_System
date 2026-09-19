import { describe, expect, it } from 'vitest';
import { getErrorMessage, getFieldErrors } from '../utils/error';
import { formatRole } from '../utils/format';
import { ROLES } from '../utils/constants';

describe('getErrorMessage', () => {
  it('returns API message when present', () => {
    const error = { response: { data: { message: 'Invalid email or password' } } };
    expect(getErrorMessage(error)).toBe('Invalid email or password');
  });

  it('falls back to default message', () => {
    expect(getErrorMessage(null, 'Fallback')).toBe('Fallback');
  });

  it('returns empty field errors safely', () => {
    expect(getFieldErrors(null)).toEqual([]);
  });
});

describe('formatRole', () => {
  it('formats known roles', () => {
    expect(formatRole(ROLES.ADMIN)).toBe('Admin');
    expect(formatRole(ROLES.WAREHOUSE_STAFF)).toBe('Warehouse Staff');
  });
});
