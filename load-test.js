import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración para cumplir el requisito II.B.3 (Mínimo 5 usuarios)
export const options = {
  stages: [
    { duration: '5s', target: 10 },  // Subir rápido a 10 usuarios
    { duration: '20s', target: 10 }, // Mantener 10 usuarios concurrentes
    { duration: '5s', target: 0 },   // Bajar a 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // El 95% de las peticiones deben ser rápidas (<500ms)
    http_req_failed: ['rate<0.01'],   // Menos del 1% de errores
  },
};

export default function () {
  // Probamos el endpoint del Dashboard que es el que más carga suele tener
  const res = http.get('http://localhost:3000/projections/dashboard/stats?careerCode=general');

  check(res, {
    'status es 200': (r) => r.status === 200,
    'tiempo de respuesta OK': (r) => r.timings.duration < 500,
  });

  sleep(1); // Simula tiempo de lectura del usuario
}