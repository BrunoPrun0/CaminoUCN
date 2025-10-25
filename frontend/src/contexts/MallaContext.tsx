// src/contexts/MallaContext.tsx
import { createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { obtenerMalla } from '../services/apiExternaService';

type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  estado: string;
  nivel: number;
  prereq: string[];
  veces_cursado: number;
};

type MallaContextType = {
  progreso: Asignatura[];
  asignaturasPorSemestre: Record<number, Asignatura[]>;
  carreraSeleccionada: { codigo: string; nombre: string; catalogo: string } | null;
  setCarreraSeleccionada: (carrera: { codigo: string; nombre: string; catalogo: string } | null) => void;
  loading: boolean;
  error: string | null;
  recargarMalla: () => Promise<void>;
};

const MallaContext = createContext<MallaContextType | undefined>(undefined);

export function MallaProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [progreso, setProgreso] = useState<Asignatura[]>([]);
  const [asignaturasPorSemestre, setAsignaturasPorSemestre] = useState<Record<number, Asignatura[]>>({});
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<{ codigo: string; nombre: string; catalogo: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar la malla
  const cargarMalla = async (carrera: { codigo: string; nombre: string; catalogo: string }) => {
    if (!usuario) return;

    setLoading(true);
    setError(null);

    try {
      const data = await obtenerMalla(carrera.codigo, carrera.catalogo, usuario.rut);
      setProgreso(data.progreso);

      const agrupadas = data.progreso.reduce(
        (acc: Record<number, Asignatura[]>, asig: Asignatura) => {
          const nivel = asig.nivel;
          if (!acc[nivel]) acc[nivel] = [];
          acc[nivel].push(asig);
          return acc;
        },
        {} as Record<number, Asignatura[]>
      );

      setAsignaturasPorSemestre(agrupadas);
    } catch (err) {
      console.error('Error al obtener progreso:', err);
      setError('Error al cargar la malla curricular');
    } finally {
      setLoading(false);
    }
  };

  // Función para recargar manualmente
  const recargarMalla = async () => {
    if (carreraSeleccionada) {
      await cargarMalla(carreraSeleccionada);
    }
  };

  // Seleccionar automáticamente la primera carrera si solo hay una
  useEffect(() => {
    if (usuario && usuario.carreras.length === 1 && !carreraSeleccionada) {
      setCarreraSeleccionada(usuario.carreras[0]);
    }
  }, [usuario, carreraSeleccionada]);

  // Cargar la malla cuando se selecciona una carrera
  useEffect(() => {
    if (carreraSeleccionada && usuario) {
      cargarMalla(carreraSeleccionada);
    }
  }, [carreraSeleccionada, usuario]);

  // Limpiar datos cuando el usuario cierra sesión
  useEffect(() => {
    if (!usuario) {
      setProgreso([]);
      setAsignaturasPorSemestre({});
      setCarreraSeleccionada(null);
      setError(null);
    }
  }, [usuario]);

  return (
    <MallaContext.Provider
      value={{
        progreso,
        asignaturasPorSemestre,
        carreraSeleccionada,
        setCarreraSeleccionada,
        loading,
        error,
        recargarMalla,
      }}
    >
      {children}
    </MallaContext.Provider>
  );
}

export function useMalla() {
  const context = useContext(MallaContext);
  if (context === undefined) {
    throw new Error('useMalla debe usarse dentro de un MallaProvider');
  }
  return context;
}

