import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useMalla } from './MallaContext';
import { calcularProyeccionAutomatica, puedeAgregarAsignatura, puedeEliminarSemestre } from '../utils/proyeccionAutomatica';
import * as proyeccionService from '../services/proyeccionesService';


type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  estado: string;
  nivel: number;
  prereq: string[];
  veces_cursado: number;
};

type SemestreProyectado = {
  numero: number;
  asignaturas: string[];
  creditos: number;
};

type SemestreGuardado = {
  numero: number;
  courses: {
    courseApiId: string;
    credits: number;
  }[];
  creditos: number;
};

type ProyeccionGuardada = {
  id: number;
  name: string;
  isFavorite: boolean;
  isAutomatic: boolean;
  semesters: SemestreGuardado[];
  createdAt: string;
  updatedAt: string;
};

type ProyeccionContextType = {
  proyeccionAutomatica: SemestreProyectado[];
  calcularAutomatica: () => void;
  proyeccionManual: SemestreProyectado[];
  setProyeccionManual: (proyeccion: SemestreProyectado[]) => void;
  moverAsignatura: (codigo: string, origen: number, destino: number) => { exito: boolean; mensaje?: string };
  removerAsignaturaDeSemestre: (codigo: string, origen: number) => { exito: boolean; mensaje?: string };
  agregarAsignaturaASemestre: (codigo: string, destino: number) => { exito: boolean; mensaje?: string };
  agregarSemestre: () => void;
  eliminarSemestre: (numero: number) => void;
  proyeccionesGuardadas: ProyeccionGuardada[];
  proyeccionSeleccionada: ProyeccionGuardada | null;
  cargarProyeccion: (id: number) => Promise<void>;
  guardarProyeccion: (nombre: string, esFavorita: boolean, esAutomatica: boolean) => Promise<void>;
  eliminarProyeccionGuardada: (id: number) => Promise<void>;
  marcarFavorita: (id: number) => Promise<void>;
  recargarProyecciones: () => Promise<void>;
  loading: boolean;
  error: string | null;
};

const ProyeccionContext = createContext<ProyeccionContextType | undefined>(undefined);

function esCapstone(asignatura: Asignatura): boolean {
  const CAPSTONE_CODE = 'ECIN-0100';
  const CAPSTONE_NAME = 'Capstone Project';
  return asignatura.codigo === CAPSTONE_CODE || 
         asignatura.asignatura === CAPSTONE_NAME ||
         asignatura.asignatura.toLowerCase().includes('capstone project');
}

export function ProyeccionProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const { progreso, carreraSeleccionada } = useMalla();
  
  const [proyeccionAutomatica, setProyeccionAutomatica] = useState<SemestreProyectado[]>([]);
  const [proyeccionManual, setProyeccionManual] = useState<SemestreProyectado[]>([]);
  const [proyeccionesGuardadas, setProyeccionesGuardadas] = useState<ProyeccionGuardada[]>([]);
  const [proyeccionSeleccionada, setProyeccionSeleccionada] = useState<ProyeccionGuardada | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const calcularAutomatica = () => {
    if (progreso.length === 0) return;
    
    console.log('Calculando proyección automática...');
    const proyeccion = calcularProyeccionAutomatica(progreso);
    setProyeccionAutomatica(proyeccion);
    setProyeccionManual(JSON.parse(JSON.stringify(proyeccion)));
  };

  const moverAsignatura = (
    codigoAsignatura: string,
    semestreOrigen: number,
    semestreDestino: number
  ): { exito: boolean; mensaje?: string } => {
    
    const asignatura = progreso.find(a => a.codigo === codigoAsignatura);
    if (!asignatura) return { exito: false, mensaje: 'Asignatura no encontrada' };

    
    const nuevaProyeccion = JSON.parse(JSON.stringify(proyeccionManual));
    
    const semOrigen = nuevaProyeccion.find((s: SemestreProyectado) => s.numero === semestreOrigen);
    const semDestino = nuevaProyeccion.find((s: SemestreProyectado) => s.numero === semestreDestino);
    
    if (!semOrigen || !semDestino) return { exito: false, mensaje: 'Semestre no encontrado' };

    const validacion = puedeAgregarAsignatura(
      codigoAsignatura,
      semDestino,
      progreso,
      nuevaProyeccion,
      semestreDestino
    );

    if (!validacion.valido) return { exito: false, mensaje: validacion.razon };

    semOrigen.asignaturas = semOrigen.asignaturas.filter((c: string) => c !== codigoAsignatura);
    semOrigen.creditos -= asignatura.creditos;
    
    semDestino.asignaturas.push(codigoAsignatura);
    semDestino.creditos += asignatura.creditos;

    setProyeccionManual(nuevaProyeccion);
    return { exito: true };
  };

  const removerAsignaturaDeSemestre = (
    codigoAsignatura: string,
    semestreOrigen: number
  ): { exito: boolean; mensaje?: string } => {
    const asignatura = progreso.find(a => a.codigo === codigoAsignatura);
    if (!asignatura) return { exito: false, mensaje: 'Asignatura no encontrada' };

    const nuevaProyeccion = JSON.parse(JSON.stringify(proyeccionManual));
    const semOrigen = nuevaProyeccion.find((s: SemestreProyectado) => s.numero === semestreOrigen);
    
    if (!semOrigen) return { exito: false, mensaje: 'Semestre no encontrado' };

    semOrigen.asignaturas = semOrigen.asignaturas.filter((c: string) => c !== codigoAsignatura);
    semOrigen.creditos -= asignatura.creditos;

    setProyeccionManual(nuevaProyeccion);
    return { exito: true };
  };

  const agregarAsignaturaASemestre = (
    codigoAsignatura: string,
    semestreDestino: number
  ): { exito: boolean; mensaje?: string } => {
    const asignatura = progreso.find(a => a.codigo === codigoAsignatura);
    if (!asignatura) return { exito: false, mensaje: 'Asignatura no encontrada' };

    const nuevaProyeccion = JSON.parse(JSON.stringify(proyeccionManual));
    const semDestino = nuevaProyeccion.find((s: SemestreProyectado) => s.numero === semestreDestino);
    
    if (!semDestino) return { exito: false, mensaje: 'Semestre no encontrado' };

    const validacion = puedeAgregarAsignatura(
      codigoAsignatura,
      semDestino,
      progreso,
      nuevaProyeccion,
      semestreDestino
    );

    if (!validacion.valido) return { exito: false, mensaje: validacion.razon };

    semDestino.asignaturas.push(codigoAsignatura);
    semDestino.creditos += asignatura.creditos;

    setProyeccionManual(nuevaProyeccion);
    return { exito: true };
  };

  const agregarSemestre = () => {
    const nuevaProyeccion = JSON.parse(JSON.stringify(proyeccionManual));
    const ultimoSemestre = nuevaProyeccion[nuevaProyeccion.length - 1];
    
    const nuevoNumero = ultimoSemestre ? ultimoSemestre.numero + 1 : 1;
    
    const nuevoSemestre: SemestreProyectado = { 
      numero: nuevoNumero, 
      asignaturas: [], 
      creditos: 0 
    };

    if (ultimoSemestre) {
      const codigoCapstone = ultimoSemestre.asignaturas.find((cod: string) => {
        const asig = progreso.find(a => a.codigo === cod);
        return asig && esCapstone(asig);
      });

      if (codigoCapstone) {
        const asigCapstone = progreso.find(a => a.codigo === codigoCapstone);
        const creditos = asigCapstone?.creditos || 0;

        ultimoSemestre.asignaturas = ultimoSemestre.asignaturas.filter((c: string) => c !== codigoCapstone);
        ultimoSemestre.creditos -= creditos;

        nuevoSemestre.asignaturas.push(codigoCapstone);
        nuevoSemestre.creditos += creditos;
      }
    }

    setProyeccionManual([...nuevaProyeccion, nuevoSemestre]);
  };

  const eliminarSemestre = (numero: number) => {
    
    if (numero <= proyeccionAutomatica.length) {
      setError('No puedes eliminar los semestres base de la proyección automática.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const validacion = puedeEliminarSemestre(numero, proyeccionManual, progreso);
    
    if (!validacion.valido) {
      setError(validacion.razon || 'No se puede eliminar este semestre');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const nuevaProyeccion = JSON.parse(JSON.stringify(proyeccionManual));
    const indiceAEliminar = nuevaProyeccion.findIndex((s: SemestreProyectado) => s.numero === numero);
    const semestreAEliminar = nuevaProyeccion[indiceAEliminar];
    const semestreAnterior = nuevaProyeccion[indiceAEliminar - 1];

    const codigoCapstone = semestreAEliminar.asignaturas.find((cod: string) => {
      const asig = progreso.find((a) => a.codigo === cod);
      return asig && esCapstone(asig);
    });

    if (codigoCapstone && semestreAnterior) {
       const asigCapstone = progreso.find(a => a.codigo === codigoCapstone);
       semestreAnterior.asignaturas.push(codigoCapstone);
       semestreAnterior.creditos += (asigCapstone?.creditos || 0);
    }

    setProyeccionManual(nuevaProyeccion.filter((s: SemestreProyectado) => s.numero !== numero));
  };

 

  const recargarProyecciones = async () => {
    if (!usuario || !carreraSeleccionada) return;
    setLoading(true);
    setError(null);
    try {
      const proyecciones = await proyeccionService.obtenerProyecciones(
        usuario.rut,
        carreraSeleccionada.codigo
      );
      const proyeccionesConvertidas: ProyeccionGuardada[] = proyecciones.map(p => ({
        ...p,
        semesters: p.semesters.map(sem => ({
          numero: sem.numero,
          courses: sem.courses,
          creditos: sem.courses.reduce((sum, c) => sum + c.credits, 0)
        }))
      }));
      setProyeccionesGuardadas(proyeccionesConvertidas);
    } catch (err) {
      console.error('Error al cargar proyecciones:', err);
      setError('Error al cargar proyecciones guardadas');
    } finally {
      setLoading(false);
    }
  };

  const cargarProyeccion = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const proyeccion = await proyeccionService.obtenerProyeccion(id);
      const semestres: SemestreProyectado[] = proyeccion.semesters.map(sem => ({
        numero: sem.numero,
        asignaturas: sem.courses.map(c => c.courseApiId),
        creditos: sem.courses.reduce((sum, c) => sum + c.credits, 0)
      }));

     
      const copiaManual = JSON.parse(JSON.stringify(semestres));
      setProyeccionManual(copiaManual);
      
      const proyeccionConvertida: ProyeccionGuardada = {
        ...proyeccion,
        semesters: proyeccion.semesters.map(sem => ({
          numero: sem.numero,
          courses: sem.courses,
          creditos: sem.courses.reduce((sum, c) => sum + c.credits, 0)
        }))
      };
      setProyeccionSeleccionada(proyeccionConvertida);
    } catch (err) {
      console.error('Error al cargar proyección:', err);
      setError('Error al cargar proyección');
    } finally {
      setLoading(false);
    }
  };

  const guardarProyeccion = async (nombre: string, esFavorita: boolean, esAutomatica: boolean) => {
    // Validaciones básicas
    if (!usuario || !carreraSeleccionada) {
      console.error("No hay usuario o carrera seleccionada");
      return;
    }

    setLoading(true);
    setError(null);

    try {
     
      const carreraEncontrada = usuario.carreras.find(c => 
        String(c.codigo) === String(carreraSeleccionada.codigo)
      );

    
      const nombreCarreraFinal = carreraEncontrada 
        ? carreraEncontrada.nombre 
        : String(carreraSeleccionada.codigo);

  
      console.log("GUARDANDO PROYECCIÓN:", {
        codigo: carreraSeleccionada.codigo,
        nombreEncontrado: nombreCarreraFinal, 
        usuarioCarreras: usuario.carreras
      });

      const proyeccionAGuardar = esAutomatica ? proyeccionAutomatica : proyeccionManual;
      const semesters = proyeccionAGuardar.map(sem => ({
        numero: sem.numero,
        courses: sem.asignaturas.map(codigo => {
          const asig = progreso.find(a => a.codigo === codigo);
          return {
            courseApiId: codigo,
            nombre: asig?.asignatura || codigo, 
            credits: asig?.creditos || 0
          };
        })
      }));

      // Payload para el backend
      const payload = {
        rut: usuario.rut,
        careerCode: String(carreraSeleccionada.codigo), 
        careerName: nombreCarreraFinal,                
        catalogCode: carreraSeleccionada.catalogo,
        name: nombre,
        isFavorite: esFavorita,
        isAutomatic: esAutomatica,
        semesters
      };

      await proyeccionService.crearProyeccion(payload);
      
      // Recargar proyecciones para actualizar la vista
      await recargarProyecciones();

    } catch (err: any) {
      console.error('Error al guardar proyección:', err);
      setError('Error al guardar proyección');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminarProyeccionGuardada = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await proyeccionService.eliminarProyeccion(id);
      await recargarProyecciones();
      if (proyeccionSeleccionada?.id === id) {
        setProyeccionSeleccionada(null);
      }
    } catch (err) {
      console.error('Error al eliminar proyección:', err);
      setError('Error al eliminar proyección');
    } finally {
      setLoading(false);
    }
  };

  const marcarFavorita = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await proyeccionService.marcarComoFavorita(id);
      await recargarProyecciones();
    } catch (err) {
      console.error('Error al marcar favorita:', err);
      setError('Error al marcar como favorita');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (progreso.length > 0 && carreraSeleccionada) {
      calcularAutomatica();
    }
  }, [progreso, carreraSeleccionada]);

  useEffect(() => {
    if (usuario && carreraSeleccionada) {
      setProyeccionManual([]);
      setProyeccionAutomatica([]);
      setProyeccionSeleccionada(null);
      recargarProyecciones();
    }
  }, [usuario, carreraSeleccionada?.codigo]);

  useEffect(() => {
    if (!usuario) {
      setProyeccionAutomatica([]);
      setProyeccionManual([]);
      setProyeccionesGuardadas([]);
      setProyeccionSeleccionada(null);
      setError(null);
    }
  }, [usuario]);

  return (
    <ProyeccionContext.Provider
      value={{
        proyeccionAutomatica,
        calcularAutomatica,
        proyeccionManual,
        setProyeccionManual,
        moverAsignatura,
        removerAsignaturaDeSemestre,
        agregarAsignaturaASemestre,
        agregarSemestre,
        eliminarSemestre,
        proyeccionesGuardadas,
        proyeccionSeleccionada,
        cargarProyeccion,
        guardarProyeccion,
        eliminarProyeccionGuardada,
        marcarFavorita,
        recargarProyecciones,
        loading,
        error,
      }}
    >
      {children}
    </ProyeccionContext.Provider>
  );
}

export function useProyeccion() {
  const context = useContext(ProyeccionContext);
  if (context === undefined) {
    throw new Error('useProyeccion debe usarse dentro de un ProyeccionProvider');
  }
  return context;
}