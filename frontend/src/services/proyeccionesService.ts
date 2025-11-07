// src/services/proyeccionService.ts

type SemestreProyectado = {
  numero: number;
  courses: {
    courseApiId: string;
    credits: number;
  }[];
  creditos?: number;
};

type ProyeccionGuardada = {
  id: number;
  name: string;
  isFavorite: boolean;
  isAutomatic: boolean;
  semesters: SemestreProyectado[];
  createdAt: string;
  updatedAt: string;
};

type CrearProyeccionPayload = {
  rut: string;
  careerCode: string;
  catalogCode: string;
  name: string;
  studentName?: string;
  studentEmail?: string;
  isFavorite: boolean;
  isAutomatic: boolean;
  semesters: SemestreProyectado[];
};

type ActualizarProyeccionPayload = {
  id: number;
  name?: string;
  isFavorite?: boolean;
  semesters?: SemestreProyectado[];
};

const BASE_URL = 'http://localhost:3000';

export async function obtenerProyecciones(
  rut: string,
  careerCode: string
): Promise<ProyeccionGuardada[]> {
  const res = await fetch(
    `${BASE_URL}/projections?rut=${rut}&careerCode=${careerCode}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) throw new Error('Error al obtener proyecciones');
  return await res.json();
}

export async function obtenerProyeccion(id: number): Promise<ProyeccionGuardada> {
  const res = await fetch(`${BASE_URL}/projections/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Error al obtener proyección');
  return await res.json();
}

export async function crearProyeccion(
  payload: CrearProyeccionPayload
): Promise<ProyeccionGuardada> {
  const res = await fetch(`${BASE_URL}/projections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear proyección');
  }
  return await res.json();
}

export async function actualizarProyeccion(
  payload: ActualizarProyeccionPayload
): Promise<ProyeccionGuardada> {
  const res = await fetch(`${BASE_URL}/projections`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Error al actualizar proyección');
  return await res.json();
}

export async function eliminarProyeccion(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/projections/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Error al eliminar proyección');
}

export async function marcarComoFavorita(id: number): Promise<ProyeccionGuardada> {
  const res = await fetch(`${BASE_URL}/projections/${id}/favorita`, {
    method: 'PUT',
  });

  if (!res.ok) throw new Error('Error al marcar como favorita');
  return await res.json();
}