import { apiPrivate } from "~/services/api";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";
import { useNavigate } from "react-router";

const useApiPrivate = () => {
  const refreshToken = useRefreshToken();
  const { accessToken } = useAuth();

  const navigate = useNavigate();

  // Enables use of dynamic values (accessToken)
  useEffect(() => {
    const requestInterceptor = apiPrivate.interceptors.request.use(
      (config) => {
        if (accessToken && !config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseInterceptor = apiPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        // Check if error is 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiPrivate({
              ...originalRequest,
              params: originalRequest.params,
            });
          } catch (error: any) {
            console.log(error.response.data.message);
            console.error("Refresh token failed");
            navigate("/auth/login");
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      apiPrivate.interceptors.request.eject(requestInterceptor);
      apiPrivate.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, refreshToken]);

  return apiPrivate;
};

export default useApiPrivate;
