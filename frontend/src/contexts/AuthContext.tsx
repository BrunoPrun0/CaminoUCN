import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Carrera = {
  codigo: string;
  nombre: string;
  catalogo: string;
};


type Usuario = {
  rut: string;
  carreras: Carrera[]; 
  rol?: 'ADMIN' | 'STUDENT';
};

type AuthContextType = {
  usuario: Usuario | null;
  login: (data: Usuario) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try {
      const item = localStorage.getItem('session_usuario');
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  const login = (data: Usuario) => {
    
    localStorage.setItem('session_usuario', JSON.stringify(data));
    setUsuario(data);
  };

  const logout = () => {
   
    localStorage.removeItem('session_usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};