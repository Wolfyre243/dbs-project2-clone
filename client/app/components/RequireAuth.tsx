import { useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth';
import React, { useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import Roles from '~/rolesConfig';

const RequireAuth = ({
  allowedRoles,
  children,
}: {
  allowedRoles: Array<number>;
  children: React.ReactNode;
}) => {
  const { role, accessToken, userId, loading } = useAuth();
  const navigate = useNavigate();

  // If role provided not found in allowed roles
  useEffect(() => {
    if (loading) return;

    (async () => {
      // SuperAdmin has highest privileges
      //@ts-ignore
      if (!(allowedRoles?.includes(role) || role == Roles.SUPERADMIN)) {
        console.log('[DEBUG] Required role not found');
        console.log('Required Roles:', allowedRoles, '\nCurrent Role:', role);
        console.log('Current user ID:', userId);
        console.log(
          '[DEBUG]',
          accessToken
            ? 'Access token found, role not permitted'
            : 'Access token not found',
        );

        return navigate('/forbidden');
      }
      console.log('[DEBUG] Authorized.');
    })();
  }, [accessToken, role, loading]);

  if (loading) return <LoadingSpinner />;

  return <>{children}</>;
};

export default RequireAuth;
