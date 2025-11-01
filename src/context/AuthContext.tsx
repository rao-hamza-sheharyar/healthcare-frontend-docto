import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: string;
  doctor?: {
    id: number;
    specialization: string;
    rating: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      // Check for token in URL (when redirected from main login or registration)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        console.log('Token found in URL, setting up auth...');
        localStorage.setItem('token', urlToken);
        setToken(urlToken);
        fetchUser(urlToken);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const userData = response.data.user;
      
      // CRITICAL: Doctor portal should ONLY accept doctors or admins
      if (userData.role === 'doctor' || userData.role === 'admin' || userData.doctor) {
        setUser(userData);
      } else {
        // User is not a doctor/admin - clear the token and session
        console.warn(`User ${userData.email} has role '${userData.role}' - not allowed in doctor portal. Clearing session.`);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: authToken, user: userData } = response.data;
    
    // CRITICAL: Doctor portal should ONLY allow login for doctors/admins
    if (userData.role !== 'doctor' && userData.role !== 'admin' && !userData.doctor) {
      console.warn(`User ${userData.email} has role '${userData.role}' - not allowed to login to doctor portal.`);
      throw new Error('Only doctors and admins can login to this portal. Please use the patient portal for patient accounts.');
    }
    
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

