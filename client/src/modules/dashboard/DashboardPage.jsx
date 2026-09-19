import { AlertTriangle, Boxes, Package, Warehouse } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { ErrorState } from '../../components/Feedback';
import { PageHeader } from '../../components/PageHeader';
import { CardSkeleton, TableSkeleton } from '../../components/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { formatNumber } from '../../utils/format';
import { fetchDashboardSummary } from './dashboardSlice';
import { fetchLowStock } from '../inventory/inventorySlice';

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
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of inventory health across warehouses"
      />

      {status === 'failed' ? (
        <ErrorState message={error} onRetry={() => dispatch(fetchDashboardSummary())} />
      ) : status === 'loading' || status === 'idle' ? (
        <CardSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, icon: Icon, to, tone }) => (
            <Link
              key={label}
              to={to}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-700"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <Icon
                  className={`h-5 w-5 ${
                    tone === 'warning' ? 'text-amber-500' : 'text-teal-600 dark:text-teal-400'
                  }`}
                />
              </div>
              <p className="text-3xl font-semibold text-slate-900 dark:text-slate-50">
                {formatNumber(value)}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Low stock products
          </h2>
          {isAdmin ? (
            <Link to="/products" className="text-sm font-medium text-teal-600 hover:underline">
              Manage products
            </Link>
          ) : null}
        </div>

        {lowStockStatus === 'failed' ? (
          <ErrorState message={lowStockError} onRetry={() => dispatch(fetchLowStock())} />
        ) : lowStockStatus === 'loading' || lowStockStatus === 'idle' ? (
          <TableSkeleton rows={4} cols={4} />
        ) : lowStock.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            All products are above their minimum stock levels.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Total stock</th>
                  <th className="px-4 py-3 font-medium">Minimum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStock.map((item) => (
                  <tr key={item.id} className="bg-amber-50/40 dark:bg-amber-950/10">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        {item.name}
                        <Badge tone="warning">Low</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{item.sku}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatNumber(item.totalStock)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {formatNumber(item.minimumStockLevel)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
