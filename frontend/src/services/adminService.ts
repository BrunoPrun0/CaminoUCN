const API_URL = 'http://localhost:3000'; 

export const obtenerCarrerasDashboard = async () => {
  const response = await fetch(`${API_URL}/projections/dashboard/careers`);
  if (!response.ok) throw new Error('Error al obtener carreras');
  return await response.json();
};

export const obtenerEstadisticas = async (careerCode?: string) => {
  let url = `${API_URL}/projections/dashboard/stats`;
  
  // Si hay filtro, lo pegamos en la URL
  if (careerCode && careerCode !== 'general') {
    url += `?careerCode=${careerCode}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error al obtener estadísticas');
  return await response.json();
};