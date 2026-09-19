import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageSkeleton } from '../components/Skeleton';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const { token, user, bootstrapStatus } = useAuth();
  const location = useLocation();

  if (token && bootstrapStatus === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <PageSkeleton />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { token, user, bootstrapStatus } = useAuth();

  if (token && bootstrapStatus === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <PageSkeleton />
      </div>
    );
  }

  if (token && user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
