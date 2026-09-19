export const Skeleton = ({ className = '' }) => (
  <div
    className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`}
    aria-hidden="true"
  />
);

export const CardSkeleton = ({ count = 4 }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <Skeleton className="mb-4 h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 6, cols = 5 }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 px-4 py-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const PageSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
    </div>
    <CardSkeleton />
    <TableSkeleton />
  </div>
);
