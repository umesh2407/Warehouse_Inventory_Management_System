import { useSelector } from 'react-redux';
import { ROLES } from '../utils/constants';

export const useAuth = () => {
  const { user, token, status, bootstrapStatus, error } = useSelector((state) => state.auth);

  return {
    user,
    token,
    status,
    bootstrapStatus,
    error,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === ROLES.ADMIN,
    isStaff: user?.role === ROLES.WAREHOUSE_STAFF,
  };
};
