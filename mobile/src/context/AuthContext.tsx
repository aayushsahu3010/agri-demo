import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as apiLogin, register as apiRegister, logout as apiLogout,
  getStorageItem, setStorageItem, removeStorageItem
} from '../services/api';

interface AuthUser {
  user_id: string;
  name: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: { name: string; phone: string; password: string; state?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getStorageItem('croopic_jwt_token');
      const userData = await getStorageItem('croopic_user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (phone: string, password: string) => {
    const data = await apiLogin(phone, password);
    const u = { user_id: data.user_id, name: data.name, phone };
    await setStorageItem('croopic_user', JSON.stringify(u));
    setUser(u);
  };

  const register = async (payload: { name: string; phone: string; password: string; state?: string }) => {
    const data = await apiRegister(payload);
    const u = { user_id: data.user_id, name: data.name, phone: payload.phone };
    await setStorageItem('croopic_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = async () => {
    await apiLogout();
    await removeStorageItem('croopic_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
