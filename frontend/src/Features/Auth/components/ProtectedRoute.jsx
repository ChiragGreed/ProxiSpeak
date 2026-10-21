import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const ProtectedRoute = ({ children }) => {
  const { currentUser, Loading, getMeHandler } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(!currentUser);
  const hasStartedAuthCheck = useRef(false);

  useEffect(() => {
    if (hasStartedAuthCheck.current) {
      return;
    }
    hasStartedAuthCheck.current = true;

    if (currentUser) {
      return;
    }

    getMeHandler().finally(() => setIsCheckingAuth(false));
  }, [currentUser, getMeHandler]);

  if (isCheckingAuth || Loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
