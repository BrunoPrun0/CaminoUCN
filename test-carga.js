import http from 'k6/http';
import { check, sleep } from 'k6';

// CONFIGURACIÓN DE LA PRUEBA (Cumple II.B.3)
export const options = {
  // Definimos las fases de la carga
  stages: [
    { duration: '10s', target: 20 }, // Subir a 20 usuarios en 10 seg (Ramp-up)
    { duration: '30s', target: 20 }, // Mantener 20 usuarios concurrentes por 30 seg (Meseta)
    { duration: '10s', target: 0 },  // Bajar a 0 usuarios (Ramp-down)
  ],
  
  // Umbrales para aprobar el checklist automáticamente
  thresholds: {
    // Menos del 1% de las peticiones pueden fallar
    http_req_failed: ['rate<0.01'], 
    // El 95% de las peticiones deben tardar menos de 500ms
    http_req_duration: ['p(95)<500'], 
  },
};

export default function () {
  // URL del Dashboard (es una buena prueba porque consulta la BD y procesa datos)
  // Asegúrate de que tu backend esté corriendo en el puerto 3000
  const url = 'http://localhost:3000/projections/dashboard/stats?careerCode=general';

  const res = http.get(url);

  // Verificaciones (Checks)
  check(res, {
    'status es 200': (r) => r.status === 200,
    'respuesta rápida': (r) => r.timings.duration < 500, // < 500ms
  });

  // Simulamos que el usuario piensa 1 segundo antes de recargar (para ser realistas)
  sleep(1);
}