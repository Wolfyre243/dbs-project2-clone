import { jwtDecode } from "jwt-decode";
import useAuth from "./useAuth";

export const useJWTDecode = () => {
  const { setRole, setUserId } = useAuth();

  const JWTDecode = async (token: string) => {
    try {
      const payload: any = await jwtDecode(token);
      console.log("[DEBUG] Decoding JWT...\nPayload:", payload);
      setRole(payload.roleId);
      setUserId(payload.userId);
      return payload;
    } catch (error) {
      console.log(error);
      setRole(null);
      setUserId(null);
    }
  };

  return JWTDecode;
};
