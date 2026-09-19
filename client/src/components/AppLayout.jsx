import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  Sun,
  Users,
  Warehouse,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from './Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../modules/auth/authSlice';
import { formatRole } from '../utils/format';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/warehouses', label: 'Warehouses', icon: Warehouse },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
];

const SidebarNav = ({ visibleNav, user, onNavigate }) => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-teal-600 text-white'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Warehouse</p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
          Inventory System
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass} onClick={onNavigate}>
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
          {user?.name}
        </p>
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
        <p className="mt-1 text-xs text-teal-600 dark:text-teal-400">{formatRole(user?.role)}</p>
      </div>
    </div>
  );
};

export const AppLayout = () => {
  const { user, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <SidebarNav visibleNav={visibleNav} user={user} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white dark:bg-slate-900">
            <div className="flex justify-end p-3">
              <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarNav
              visibleNav={visibleNav}
              user={user}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
