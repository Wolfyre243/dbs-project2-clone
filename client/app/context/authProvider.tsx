// This file creates the context needed to share the stored token
import React, { createContext, useState } from "react";

export type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  role: number | null;
  setRole: (role: number | null) => void;
  userId: number | null;
  setUserId: (userId: number | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Store accessToken and roles here
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        role,
        setRole,
        userId,
        setUserId,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Allows components to obtain the accessToken
export default AuthContext;
