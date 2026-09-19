export const PageHeader = ({ title, description, actions }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        {title}
      </h1>
      {description ? (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
  </div>
);
