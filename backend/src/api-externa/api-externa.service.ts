import { BadRequestException, Injectable } from '@nestjs/common';

const ADMIN_MOCK_CREDENTIALS = {
  email: 'admin@ucn.cl', // Pon aquí el correo de ejemplo que te dieron
  password: 'password123', // Pon aquí la contraseña de ejemplo
};
@Injectable()
export class ApiExternaService {
  async getProgreso(codCarrera: string, catalogo: string, rut: string) {
    try {
      console.log('Service iniciando getProgreso para:', {
        codCarrera,
        catalogo,
        rut,
      });

      const urlMalla = `https://losvilos.ucn.cl/hawaii/api/mallas?${codCarrera}-${catalogo}`;
      const urlAvance = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${rut}&codcarrera=${codCarrera}`;
      const headers = { 'X-HAWAII-AUTH': 'jf400fejof13f' };

      // Obtener malla
      console.log('Fetching malla desde:', urlMalla);
      const resMalla = await fetch(urlMalla, {
        method: 'GET',
        headers,
        redirect: 'follow',
      });
      const mallaData = await resMalla.json();

      if (mallaData.error) {
        throw new BadRequestException('Error ' + mallaData.error);
      }
      console.log('Malla obtenida:', mallaData.length, 'asignaturas');

      // Obtener avance
      console.log('Fetching avance desde:', urlAvance);
      const resAvance = await fetch(urlAvance, {
        method: 'GET',
        redirect: 'follow',
      });
      const avanceData = await resAvance.json();

      if (avanceData.error) {
        throw new BadRequestException('Error ' + avanceData.error);
      }

      console.log('✅ Avance obtenido:', avanceData.length, 'inscripciones');
      console.log('📋 Primera inscripción:', avanceData[0]);
      console.log(
        '📋 Campos de inscripción:',
        Object.keys(avanceData[0] || {}),
      );

      // Ordenar inscripciones por periodo (más reciente primero)
      const inscripcionesOrdenadas = [...avanceData].sort((a, b) => {
        return b.period.localeCompare(a.period);
      });

      // Crear un mapa para obtener el estado más reciente de cada curso
      const estadosPorCodigo = new Map();

      // Procesar solo inscripciones no excluidas (ya ordenadas)
      inscripcionesOrdenadas
        .filter((inscripcion) => !inscripcion.excluded)
        .forEach((inscripcion) => {
          const codigo = inscripcion.course;

          // Si no existe, agregar (como están ordenadas, el primero es el más reciente)
          if (!estadosPorCodigo.has(codigo)) {
            estadosPorCodigo.set(codigo, inscripcion);
          }
        });

      console.log(
        'Estados procesados:',
        estadosPorCodigo.size,
        'cursos únicos',
      );

      // Combinar malla con estados
      const progreso = mallaData.map((asig) => {
        const estadoReciente = estadosPorCodigo.get(asig.codigo);
        const estado = estadoReciente?.status || 'NO CURSADA';

        // Normalizar prerequisitos: siempre retornar array
        let prereqArray: string[] = [];
        if (asig.prereq) {
          if (typeof asig.prereq === 'string') {
            prereqArray = asig.prereq
              .split(',')
              .map((p) => p.trim())
              .filter((p) => p.length > 0);
          } else if (Array.isArray(asig.prereq)) {
            prereqArray = asig.prereq
              .map((p) => p.trim())
              .filter((p) => p.length > 0);
          }
        }

        return {
          codigo: asig.codigo,
          asignatura: asig.asignatura,
          creditos: asig.creditos,
          nivel: asig.nivel,
          prereq: prereqArray,
          estado,
          veces_cursado: 0, // Se calculará en el frontend
        };
      });

      // Contar aprobadas y reprobadas correctamente
      // Solo contar el estado más reciente de cada asignatura
      const aprobadas = progreso.filter((p) => p.estado === 'APROBADO').length;
      const reprobadas = progreso.filter(
        (p) => p.estado === 'REPROBADO',
      ).length;

      console.log('Estadísticas:');
      console.log('   - Aprobadas:', aprobadas);
      console.log('   - Reprobadas:', reprobadas);
      console.log(
        '   - No cursadas:',
        progreso.filter((p) => p.estado === 'NO CURSADA').length,
      );

      // Construir el objeto de respuesta
      const respuesta = {
        rut,
        carrera: codCarrera,
        catalogo,
        totalAsignaturas: mallaData.length,
        aprobadas,
        reprobadas,
        progreso,
        inscripciones: avanceData,
      };

      // Verificar qué se va a retornar
      console.log('Objeto respuesta construido:');
      console.log('   - totalAsignaturas:', respuesta.totalAsignaturas);
      console.log('   - aprobadas:', respuesta.aprobadas);
      console.log('   - reprobadas:', respuesta.reprobadas);
      console.log('   - progreso.length:', respuesta.progreso.length);
      console.log('   - inscripciones.length:', respuesta.inscripciones.length);
      console.log(
        '   - Tiene campo inscripciones?:',
        'inscripciones' in respuesta,
      );
      console.log('   - Primera inscripción:', respuesta.inscripciones[0]);

      return respuesta;
    } catch (err) {
      console.error('Error en getProgreso:', err);

      // Re-throw BadRequestException as-is
      if (err instanceof BadRequestException) {
        throw err;
      }

      // For other errors, throw generic error
      throw new Error('Error al conectar con la API externa malla');
    }
  }

  async login(email: string, password: string) {
    // 1. INTERCEPCIÓN (MOCK): ¿Es el usuario administrador simulado?
    if (
      email === ADMIN_MOCK_CREDENTIALS.email &&
      password === ADMIN_MOCK_CREDENTIALS.password
    ) {
      console.log('Iniciando sesión simulada de ADMIN');
      return {
        rut: '99.999.999-K',
        nombre: 'Director de Carrera',
        carreras: [
          {
            codigo: 'ICCI',
            nombre: 'Ingeniería Civil en Computación',
            catalogo: '2020',
          },
        ],
        rol: 'ADMIN',
      };
      return;
    }

    // 2. FLUJO NORMAL: Si no es el admin, vamos a la API real para los estudiantes
    try {
      const data = await fetch(
        `https://puclaro.ucn.cl/eross/avance/login.php?email=${email}&password=${password}`,
      );
      const studentData = await data.json();

      if (studentData.error) {
        throw new BadRequestException('Error ' + studentData.error);
      }

      // Los usuarios normales que vienen de la API son STUDENT por defecto
      return {
        ...studentData,
        rol: 'STUDENT',
      };
    } catch (err) {
      console.error('Error en login:', err);

      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new Error('Error al conectar con la API externa');
    }
  }
}
