import { Navigate } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';
import type { JSX } from 'react';
export const RutaProtegida = ({ children }: { children: JSX.Element }) => {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
};