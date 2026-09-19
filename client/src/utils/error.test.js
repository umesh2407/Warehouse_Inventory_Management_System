import { describe, expect, it } from 'vitest';
import { ROLES } from './constants';
import {
  getErrorMessage,
  getFieldErrors,
  isValidationError,
  rejectMutationError,
} from './error';
import { formatRole } from './format';

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

describe('rejectMutationError', () => {
  it('returns message only for 422 validation errors', () => {
    const error = {
      response: { status: 422, data: { message: 'Warehouse capacity exceeded' } },
    };
    expect(isValidationError(error)).toBe(true);
    expect(rejectMutationError(error, 'Failed')).toBe('Warehouse capacity exceeded');
  });

  it('returns null for non-422 errors (toast handles them)', () => {
    const error = {
      response: { status: 409, data: { message: 'SKU already exists' } },
    };
    expect(rejectMutationError(error, 'Failed')).toBeNull();
  });
});

describe('formatRole', () => {
  it('formats known roles', () => {
    expect(formatRole(ROLES.ADMIN)).toBe('Admin');
    expect(formatRole(ROLES.WAREHOUSE_STAFF)).toBe('Warehouse Staff');
  });
});
