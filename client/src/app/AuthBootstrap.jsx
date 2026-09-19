import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../modules/auth/authSlice';
import { getAuthToken } from '../utils/cookies';

export const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return children;
};
