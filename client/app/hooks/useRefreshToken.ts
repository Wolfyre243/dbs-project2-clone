// Import services and hooks
import { apiPrivate } from "../services/api";
import useAuth from "./useAuth";
import { jwtDecode } from "jwt-decode";

const useRefreshToken = () => {
  const { setAccessToken, setRole, setUserId } = useAuth();

  // Define access token refresh function
  const refreshToken = async () => {
    try {
      console.log("[DEBUG] Refreshing access token...");
      // Call endpoint to get new accessToken
      const response = await apiPrivate.post("/auth/refresh", {
        withCredentials: true,
      });

      // Helps set role in context
      const payload: any = jwtDecode(response.data.accessToken);
      setAccessToken(response.data.accessToken);
      setRole(payload.roleId);
      setUserId(payload.userId);

      return response.data.accessToken;
    } catch (error: any) {
      setAccessToken("");
      setRole(null);
      setUserId(null);
      throw error;
    }
  };

  return refreshToken;
};

export default useRefreshToken;
