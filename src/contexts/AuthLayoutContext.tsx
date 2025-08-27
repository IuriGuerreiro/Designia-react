import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthLayoutContextType {
  onSwitchToLogin: () => void;
  onSwitchToRegister: () => void;
  onSwitchToPasswordReset: () => void;
}

const AuthLayoutContext = createContext<AuthLayoutContextType | undefined>(undefined);

interface AuthLayoutProviderProps {
  children: ReactNode;
}

export const AuthLayoutProvider: React.FC<AuthLayoutProviderProps> = ({ children }) => {
  const navigate = useNavigate();

  const onSwitchToLogin = () => {
    navigate('/login');
  };

  const onSwitchToRegister = () => {
    navigate('/register');
  };

  const onSwitchToPasswordReset = () => {
    navigate('/password-reset');
  };

  const value: AuthLayoutContextType = {
    onSwitchToLogin,
    onSwitchToRegister,
    onSwitchToPasswordReset,
  };

  return (
    <AuthLayoutContext.Provider value={value}>
      {children}
    </AuthLayoutContext.Provider>
  );
};

export const useAuthLayout = (): AuthLayoutContextType => {
  const context = useContext(AuthLayoutContext);
  if (context === undefined) {
    throw new Error('useAuthLayout must be used within an AuthLayoutProvider');
  }
  return context;
};
