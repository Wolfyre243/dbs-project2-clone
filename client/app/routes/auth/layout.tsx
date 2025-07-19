import { useLayoutEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import useAuth from '~/hooks/useAuth';
import useRefreshToken from '~/hooks/useRefreshToken';
import Roles from '~/rolesConfig';

export default function AuthLayout() {
  const { accessToken, role } = useAuth();
  const refreshToken = useRefreshToken();

  const navigate = useNavigate();

  // Auto-refresh access token, as long as refresh token is available.
  useLayoutEffect(() => {
    (async () => {
      if (accessToken && (role === Roles.ADMIN || role === Roles.SUPERADMIN)) {
        return navigate('/admin');
      }
      if (accessToken) {
        navigate('/home');
      } else {
        // If access token is gone from memory, generate a new one
        try {
          await refreshToken();
        } catch (error) {
          console.log(error);
        }
      }
    })();
  }, [accessToken]);

  return <Outlet />;
}
