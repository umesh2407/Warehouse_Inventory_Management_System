import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../components/Feedback';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../hooks/useAuth';
import { clearAuthError, login } from './authSlice';
import { Moon, Sun, Warehouse } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!emailPattern.test(form.email.trim())) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const result = await dispatch(
      login({ email: form.email.trim(), password: form.password })
    );

    if (login.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-teal-50 to-slate-200 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950">
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-4 top-4"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 text-white">
            <Warehouse className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Warehouse Inventory
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage products, warehouses, and stock
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            error={errors.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            error={errors.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />

          {error ? <Alert tone="error">{error}</Alert> : null}

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
};
