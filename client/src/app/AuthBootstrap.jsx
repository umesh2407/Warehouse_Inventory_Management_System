import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../modules/auth/authSlice';
import { TOKEN_KEY } from '../utils/constants';

export const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return children;
};
