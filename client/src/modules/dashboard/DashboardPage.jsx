import { AlertTriangle, Boxes, Package, Warehouse } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../components/Feedback';
import { LowStockAnalysis } from '../../components/LowStockAnalysis';
import { PageHeader } from '../../components/PageHeader';
import { CardSkeleton, Skeleton } from '../../components/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { formatNumber } from '../../utils/format';
import { fetchLowStock } from '../inventory/inventorySlice';
import { fetchDashboardSummary } from './dashboardSlice';

const LowStockSkeleton = () => (
  <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
    {[1, 2].map((key) => (
      <div key={key} className="space-y-3">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="mt-4 h-9 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const { isAdmin } = useAuth();
  const { summary, status, error } = useSelector((state) => state.dashboard);
  const { lowStock, lowStockStatus, lowStockError } = useSelector((state) => state.inventory);

  useEffect(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchLowStock());
  }, [dispatch]);

  const cards = [
    {
      label: 'Total Products',
      value: summary?.totalProducts,
      icon: Package,
      to: '/products',
    },
    {
      label: 'Warehouses',
      value: summary?.totalWarehouses,
      icon: Warehouse,
      to: '/warehouses',
    },
    {
      label: 'Total Stock',
      value: summary?.totalStockQuantity,
      icon: Boxes,
      to: '/inventory',
    },
    {
      label: 'Low Stock Items',
      value: summary?.lowStockProducts,
      icon: AlertTriangle,
      to: '/inventory',
      tone: 'warning',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Dashboard"
        description="Overview of inventory health across warehouses"
      />

      {status === 'failed' ? (
        <ErrorState message={error} onRetry={() => dispatch(fetchDashboardSummary())} />
      ) : status === 'loading' || status === 'idle' ? (
        <CardSkeleton />
      ) : (
        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, to, tone }) => {
            const isWarning = tone === 'warning';
            return (
              <Link
                key={label}
                to={to}
                className={`flex items-start justify-between rounded-xl border p-6 shadow-sm transition hover:shadow-md ${
                  isWarning
                    ? 'border-amber-400 bg-amber-50 hover:border-amber-500 dark:border-amber-600 dark:bg-amber-950/40 dark:hover:border-amber-500'
                    : 'border-slate-200 bg-white hover:border-teal-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-700'
                }`}
              >
                <div>
                  <h3 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {label}
                  </h3>
                  <p
                    className={`text-3xl font-bold tracking-tight ${
                      isWarning
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-slate-900 dark:text-slate-50'
                    }`}
                  >
                    {formatNumber(value)}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] ${
                    isWarning
                      ? 'bg-amber-100 text-amber-500 dark:bg-amber-900/60 dark:text-amber-400'
                      : 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Low Stock Analysis
          </h2>
          {isAdmin ? (
            <Link
              to="/products"
              className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
            >
              Manage products
            </Link>
          ) : (
            <Link
              to="/inventory"
              className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
            >
              View inventory
            </Link>
          )}
        </div>

        {lowStockStatus === 'failed' ? (
          <ErrorState message={lowStockError} onRetry={() => dispatch(fetchLowStock())} />
        ) : lowStockStatus === 'loading' || lowStockStatus === 'idle' ? (
          <LowStockSkeleton />
        ) : lowStock.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            All products are above their minimum stock levels.
          </div>
        ) : (
          <LowStockAnalysis items={lowStock} />
        )}
      </div>
    </div>
  );
};
