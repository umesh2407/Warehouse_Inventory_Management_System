import { AlertCircle, Inbox } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
    <Inbox className="mb-3 h-10 w-10 text-slate-400" />
    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
    {description ? (
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
    ) : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-6 py-10 text-center dark:border-rose-900/50 dark:bg-rose-950/30">
    <AlertCircle className="mb-3 h-10 w-10 text-rose-500" />
    <p className="text-sm text-rose-700 dark:text-rose-300">{message || 'Something went wrong'}</p>
    {onRetry ? (
      <Button className="mt-4" variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    ) : null}
  </div>
);

export const Alert = ({ tone = 'info', children }) => {
  const tones = {
    info: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200',
    error:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${tones[tone]}`} role="alert">
      {children}
    </div>
  );
};
