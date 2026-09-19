import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';

describe('Skeleton components', () => {
  it('renders card skeleton placeholders', () => {
    const { container } = render(<CardSkeleton count={2} />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('renders table skeleton rows', () => {
    render(<TableSkeleton rows={3} cols={4} />);
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('login validation helper', () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateLogin = ({ email, password }) => {
    const errors = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!emailPattern.test(email.trim())) errors.email = 'Enter a valid email';
    if (!password) errors.password = 'Password is required';
    return errors;
  };

  it('requires email and password', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Email is required',
      password: 'Password is required',
    });
  });

  it('rejects invalid email', () => {
    expect(validateLogin({ email: 'bad', password: 'secret' }).email).toBe(
      'Enter a valid email'
    );
  });

  it('passes valid credentials shape', () => {
    expect(validateLogin({ email: 'admin@warehouse.local', password: 'Admin@12345' })).toEqual(
      {}
    );
  });
});

describe('role helper', () => {
  const isAdmin = (role) => role === 'ADMIN';

  it('identifies admin role', () => {
    expect(isAdmin('ADMIN')).toBe(true);
    expect(isAdmin('WAREHOUSE_STAFF')).toBe(false);
  });

  it('renders nothing special for smoke', () => {
    render(<div>ok</div>);
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});
