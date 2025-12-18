import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Subir a 20 usuarios en 10 seg 
    { duration: '30s', target: 20 }, // Mantener 20 usuarios concurrentes por 30 seg 
    { duration: '10s', target: 0 },  // Bajar a 0 usuarios 
  ],
  
  // Umbrales 
  thresholds: {
    // Menos del 1% de las peticiones pueden fallar
    http_req_failed: ['rate<0.01'], 
    // El 95% de las peticiones deben tardar menos de 500ms
    http_req_duration: ['p(95)<500'], 
  },
};

export default function () {

  const url = 'http://localhost:3000/projections/dashboard/stats?careerCode=general';

  const res = http.get(url);

  // Verificaciones (Checks)
  check(res, {
    'status es 200': (r) => r.status === 200,
    'respuesta rápida': (r) => r.timings.duration < 500, // 
  });

  // Simulacion de lectura
  sleep(1);
}