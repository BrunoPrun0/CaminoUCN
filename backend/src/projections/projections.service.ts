import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CrearProyeccionDto,
  ActualizarProyeccionDto,
} from './dto/projection.dto';

@Injectable()
export class ProjectionsService {
  constructor(private prisma: PrismaService) {}

  async obtenerProyecciones(rut: string, careerCode: string) {
    // Buscar estudiante
    const student = await this.prisma.student.findUnique({
      where: { apiStudentId: rut },
      include: {
        projections: {
          where: {
            careerCode: careerCode, // Filtrar por carrera específica
          },
          include: {
            courses: {
              orderBy: [{ semesterNumber: 'asc' }, { courseApiId: 'asc' }],
            },
          },
          orderBy: [
            { isFavorite: 'desc' },
            { isAutomatic: 'desc' },
            { updatedAt: 'desc' },
          ],
        },
      },
    });

    if (!student) {
      return []; // No tiene proyecciones guardadas
    }

    // Transformar a formato esperado por el frontend
    return student.projections.map((proj) => {
      // Agrupar cursos por semestre
      const semesterMap = new Map<number, any[]>();

      proj.courses.forEach((course) => {
        if (!semesterMap.has(course.semesterNumber)) {
          semesterMap.set(course.semesterNumber, []);
        }
        semesterMap.get(course.semesterNumber)!.push({
          courseApiId: course.courseApiId,
          credits: course.credits,
        });
      });

      // Convertir a array de semestres
      const semesters = Array.from(semesterMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([numero, courses]) => ({
          numero,
          courses,
          creditos: courses.reduce((sum, c) => sum + c.credits, 0),
        }));

      return {
        id: proj.id,
        name: proj.name,
        isFavorite: proj.isFavorite,
        isAutomatic: proj.isAutomatic,
        semesters,
        createdAt: proj.createdAt,
        updatedAt: proj.updatedAt,
      };
    });
  }

  async obtenerProyeccion(id: number) {
    const proyeccion = await this.prisma.projection.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: [{ semesterNumber: 'asc' }, { courseApiId: 'asc' }],
        },
        student: true,
      },
    });

    if (!proyeccion) {
      throw new NotFoundException('Proyección no encontrada');
    }

    // Agrupar por semestre
    const semesterMap = new Map<number, any[]>();

    proyeccion.courses.forEach((course) => {
      if (!semesterMap.has(course.semesterNumber)) {
        semesterMap.set(course.semesterNumber, []);
      }
      semesterMap.get(course.semesterNumber)!.push({
        courseApiId: course.courseApiId,
        credits: course.credits,
      });
    });

    const semesters = Array.from(semesterMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([numero, courses]) => ({
        numero,
        courses,
        creditos: courses.reduce((sum, c) => sum + c.credits, 0),
      }));

    return {
      id: proyeccion.id,
      name: proyeccion.name,
      isFavorite: proyeccion.isFavorite,
      isAutomatic: proyeccion.isAutomatic,
      semesters,
      student: {
        rut: proyeccion.student.apiStudentId,
        name: proyeccion.student.name,
        email: proyeccion.student.email,
      },
      createdAt: proyeccion.createdAt,
      updatedAt: proyeccion.updatedAt,
    };
  }

  async crearProyeccion(dto: CrearProyeccionDto) {
    try {
      console.log('Iniciando creación de proyección:', {
        rut: dto.rut,
        careerCode: dto.careerCode,
        catalogCode: dto.catalogCode,
        name: dto.name,
        cantidadSemestres: dto.semesters.length,
        totalCursos: dto.semesters.reduce(
          (sum, s) => sum + s.courses.length,
          0,
        ),
      });

      // Buscar o crear estudiante
      let student = await this.prisma.student.findUnique({
        where: { apiStudentId: dto.rut },
      });

      if (!student) {
        console.log('Creando nuevo estudiante...');
        student = await this.prisma.student.create({
          data: {
            apiStudentId: dto.rut,
            name: dto.studentName,
            email: dto.studentEmail,
            careerCode: dto.careerCode,
            catalogCode: dto.catalogCode,
          },
        });
        console.log('Estudiante creado:', student.id);
      } else {
        console.log('Estudiante encontrado:', student.id);
      }

      // Verificar que no exceda las 3 proyecciones POR CARRERA
      const count = await this.prisma.projection.count({
        where: {
          studentId: student.id,
          careerCode: dto.careerCode,
        },
      });

      console.log(
        `Proyecciones existentes para carrera ${dto.careerCode}:`,
        count,
      );

      if (count >= 3) {
        throw new BadRequestException(
          `Ya tienes 3 proyecciones guardadas para esta carrera. Elimina una para crear otra.`,
        );
      }

      // Si se marca como favorita, desmarcar las demás DE ESTA CARRERA
      if (dto.isFavorite) {
        console.log('Desmarcando otras favoritas de esta carrera...');
        await this.prisma.projection.updateMany({
          where: {
            studentId: student.id,
            careerCode: dto.careerCode,
            isFavorite: true,
          },
          data: {
            isFavorite: false,
          },
        });
      }

      // Validar que todos los cursos tengan datos válidos
      const cursosInvalidos = dto.semesters.flatMap((sem) =>
        sem.courses.filter((c) => !c.courseApiId || c.credits === undefined),
      );

      if (cursosInvalidos.length > 0) {
        console.error('Cursos inválidos detectados:', cursosInvalidos);
        throw new BadRequestException(
          'Hay cursos con datos inválidos en la proyección',
        );
      }

      console.log('Creando proyección en la base de datos...');

      // Crear proyección con cursos
      const projection = await this.prisma.projection.create({
        data: {
          studentId: student.id,
          careerCode: dto.careerCode,
          catalogCode: dto.catalogCode,
          name: dto.name,
          isFavorite: dto.isFavorite,
          isAutomatic: dto.isAutomatic,
          courses: {
            create: dto.semesters.flatMap((semester) =>
              semester.courses.map((course) => ({
                courseApiId: course.courseApiId,
                courseName: course.nombre || course.courseApiId,
                semesterNumber: semester.numero,
                credits: course.credits,
              })),
            ),
          },
        },
        include: {
          courses: true,
        },
      });

      console.log('Proyección creada exitosamente:', projection.id);
      return projection;
    } catch (error) {
      console.error('Error al crear proyección:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      // Log más detallado del error
      if (error.code) {
        console.error('Código de error Prisma:', error.code);
      }
      if (error.meta) {
        console.error('Metadata del error:', error.meta);
      }

      throw new BadRequestException(
        `Error al crear proyección: ${error.message}`,
      );
    }
  }

  async actualizarProyeccion(dto: ActualizarProyeccionDto) {
    const proyeccion = await this.prisma.projection.findUnique({
      where: { id: dto.id },
      include: { student: true },
    });

    if (!proyeccion) {
      throw new NotFoundException('Proyección no encontrada');
    }

    // Si se marca como favorita, desmarcar las demás DE ESTA CARRERA
    if (dto.isFavorite) {
      await this.prisma.projection.updateMany({
        where: {
          studentId: proyeccion.studentId,
          careerCode: proyeccion.careerCode, // Solo de esta carrera
          isFavorite: true,
          id: { not: dto.id },
        },
        data: {
          isFavorite: false,
        },
      });
    }

    // Actualizar proyección
    const dataToUpdate: any = {};
    if (dto.name !== undefined) dataToUpdate.name = dto.name;
    if (dto.isFavorite !== undefined) dataToUpdate.isFavorite = dto.isFavorite;

    // Si hay nuevos semestres, eliminar los antiguos y crear los nuevos
    if (dto.semesters !== undefined) {
      await this.prisma.projectionCourse.deleteMany({
        where: { projectionId: dto.id },
      });

      dataToUpdate.courses = {
        create: dto.semesters.flatMap((semester) =>
          semester.courses.map((course) => ({
            courseApiId: course.courseApiId,
            courseName: course.nombre || course.courseApiId,
            semesterNumber: semester.numero,
            credits: course.credits,
          })),
        ),
      };
    }

    return this.prisma.projection.update({
      where: { id: dto.id },
      data: dataToUpdate,
      include: {
        courses: true,
      },
    });
  }

  async eliminarProyeccion(id: number) {
    const proyeccion = await this.prisma.projection.findUnique({
      where: { id },
    });

    if (!proyeccion) {
      throw new NotFoundException('Proyección no encontrada');
    }

    return this.prisma.projection.delete({
      where: { id },
    });
  }

  async marcarComoFavorita(id: number) {
    const proyeccion = await this.prisma.projection.findUnique({
      where: { id },
    });

    if (!proyeccion) {
      throw new NotFoundException('Proyección no encontrada');
    }

    // Desmarcar todas las favoritas DE ESTA CARRERA
    await this.prisma.projection.updateMany({
      where: {
        studentId: proyeccion.studentId,
        careerCode: proyeccion.careerCode, // Solo de esta carrera
        isFavorite: true,
      },
      data: {
        isFavorite: false,
      },
    });

    // Marcar esta como favorita
    return this.prisma.projection.update({
      where: { id },
      data: { isFavorite: true },
    });
  }

//para demanda (solo admi)
 async obtenerCarrerasActivas() {
    const carreras = await this.prisma.projection.findMany({
      where: { isFavorite: true },
      distinct: ['careerCode'],
      select: { careerCode: true },
    });

    // Retornamos directamente lo que hay en la BD
    return carreras.map((c) => ({
      codigo: c.careerCode,
      nombre: c.careerCode, // Usamos el código como nombre ya que no tienes tabla de Carreras
    }));
  }

  // 2. ESTADÍSTICAS DASHBOARD (Corregido Semestre 1 + Nombres Reales)
  async obtenerEstadisticasDashboard(careerCode?: string) {
    const filtro: any = { isFavorite: true };

    if (careerCode && careerCode !== 'general') {
      filtro.careerCode = careerCode;
    }

    // PASO 1: Contar usando SOLO el código (para evitar duplicados por nombres mal escritos)
    // Y filtramos ESTRICTAMENTE por semesterNumber: 1
    const conteo = await this.prisma.projectionCourse.groupBy({
      by: ['courseApiId'],
      where: {
        semesterNumber: 1, // <--- ESTO ARREGLA QUE NO SALGAN RAMOS DE OTROS SEMESTRES
        projection: filtro,
      },
      _count: { courseApiId: true },
      orderBy: {
        _count: { courseApiId: 'desc' },
      },
      take: 20,
    });

    if (conteo.length === 0) return [];

    // PASO 2: Obtener los nombres reales de esos códigos desde la BD
    const codigos = conteo.map(c => c.courseApiId);
    
    const nombresReales = await this.prisma.projectionCourse.findMany({
      where: {
        courseApiId: { in: codigos },
        courseName: { not: null }, // Buscamos registros que sí tengan nombre
      },
      distinct: ['courseApiId'], // Solo necesitamos un nombre por código
      select: { courseApiId: true, courseName: true }
    });

    // PASO 3: Unir el conteo con el nombre encontrado
    return conteo.map((item) => {
      const infoNombre = nombresReales.find(n => n.courseApiId === item.courseApiId);
      
      return {
        codigo: item.courseApiId,
        nombre: infoNombre?.courseName || item.courseApiId, // Si no hay nombre, muestra el código
        interesados: item._count.courseApiId,
      };
    });
  }
}

