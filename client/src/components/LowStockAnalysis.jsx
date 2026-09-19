import { formatNumber } from '../utils/format';

/**
 * Visual bar: current stock vs minimum threshold.
 * Scale uses max(current, minimum) so the min marker and fill stay in view.
 */
export const LowStockBar = ({
  name,
  sku,
  totalStock = 0,
  minimumStockLevel = 0,
}) => {
  const current = Number(totalStock) || 0;
  const minimum = Number(minimumStockLevel) || 0;
  const deficit = minimum - current;
  const scale = Math.max(current, minimum, 1);
  const fillPercent = Math.min(100, Math.max(0, (current / scale) * 100));
  const thresholdPercent = Math.min(100, Math.max(0, (minimum / scale) * 100));
  const isCritical = current === 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-base font-semibold text-slate-900 dark:text-slate-50 sm:text-lg">
            {name}
          </span>
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            Low Stock
          </span>
        </div>
        <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
          SKU: {sku}
        </span>
      </div>

      <div>
        <div className="relative mt-8 h-9 w-full overflow-visible rounded-md bg-slate-200 dark:bg-slate-700">
          <div
            className={`flex h-full min-w-0 items-center rounded-l-md pl-3 text-sm font-semibold text-white transition-[width] duration-700 ease-out ${
              isCritical
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-amber-500 to-rose-500'
            } ${fillPercent >= 99 ? 'rounded-r-md' : ''}`}
            style={{ width: `${fillPercent}%` }}
          >
            {fillPercent >= 18 ? (
              <span className="truncate whitespace-nowrap drop-shadow-sm">
                {formatNumber(current)} Units
              </span>
            ) : null}
          </div>

          <div
            className="pointer-events-none absolute z-10 w-0.5 bg-slate-900 dark:bg-white"
            style={{
              left: `${thresholdPercent}%`,
              top: '-10px',
              bottom: '-10px',
            }}
            aria-hidden="true"
          />
          <div
            className={`pointer-events-none absolute z-10 top-[-28px] whitespace-nowrap rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 ${
              thresholdPercent < 12
                ? 'left-0 translate-x-0'
                : thresholdPercent > 88
                  ? 'right-0 left-auto translate-x-0'
                  : '-translate-x-1/2'
            }`}
            style={
              thresholdPercent >= 12 && thresholdPercent <= 88
                ? { left: `${thresholdPercent}%` }
                : undefined
            }
          >
            Min: {formatNumber(minimum)}
          </div>
        </div>

        {fillPercent < 18 ? (
          <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300 sm:hidden">
            {formatNumber(current)} units current
          </p>
        ) : null}

        <div className="mt-3 flex flex-col gap-1 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Current Stock:{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatNumber(current)}
            </span>
          </p>
          <p className="font-medium text-rose-600 dark:text-rose-400">
            Deficit:{' '}
            <span className="font-semibold">
              -{formatNumber(Math.max(deficit, 0))} units
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const LowStockAnalysis = ({ items }) => (
  <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    {items.map((item) => (
      <LowStockBar
        key={item.id}
        name={item.name}
        sku={item.sku}
        totalStock={item.totalStock}
        minimumStockLevel={item.minimumStockLevel}
      />
    ))}
  </div>
);
