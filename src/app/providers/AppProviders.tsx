import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => (
  <BrowserRouter>
    <AuthProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </AuthProvider>
  </BrowserRouter>
);
