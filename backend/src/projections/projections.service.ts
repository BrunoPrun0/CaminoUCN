// src/proyecciones/proyecciones.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearProyeccionDto, ActualizarProyeccionDto } from './dto/projection.dto';

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
            careerCode: careerCode // Filtrar por carrera específica
          },
          include: {
            courses: {
              orderBy: [
                { semesterNumber: 'asc' },
                { courseApiId: 'asc' }
              ]
            }
          },
          orderBy: [
            { isFavorite: 'desc' },
            { isAutomatic: 'desc' },
            { updatedAt: 'desc' },
          ],
        }
      }
    });

    if (!student) {
      return []; // No tiene proyecciones guardadas
    }

    // Transformar a formato esperado por el frontend
    return student.projections.map(proj => {
      // Agrupar cursos por semestre
      const semesterMap = new Map<number, any[]>();
      
      proj.courses.forEach(course => {
        if (!semesterMap.has(course.semesterNumber)) {
          semesterMap.set(course.semesterNumber, []);
        }
        semesterMap.get(course.semesterNumber)!.push({
          courseApiId: course.courseApiId,
          credits: course.credits
        });
      });

      // Convertir a array de semestres
      const semesters = Array.from(semesterMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([numero, courses]) => ({
          numero,
          courses,
          creditos: courses.reduce((sum, c) => sum + c.credits, 0)
        }));

      return {
        id: proj.id,
        name: proj.name,
        isFavorite: proj.isFavorite,
        isAutomatic: proj.isAutomatic,
        semesters,
        createdAt: proj.createdAt,
        updatedAt: proj.updatedAt
      };
    });
  }

  async obtenerProyeccion(id: number) {
    const proyeccion = await this.prisma.projection.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: [
            { semesterNumber: 'asc' },
            { courseApiId: 'asc' }
          ]
        },
        student: true
      }
    });

    if (!proyeccion) {
      throw new NotFoundException('Proyección no encontrada');
    }

    // Agrupar por semestre
    const semesterMap = new Map<number, any[]>();
    
    proyeccion.courses.forEach(course => {
      if (!semesterMap.has(course.semesterNumber)) {
        semesterMap.set(course.semesterNumber, []);
      }
      semesterMap.get(course.semesterNumber)!.push({
        courseApiId: course.courseApiId,
        credits: course.credits
      });
    });

    const semesters = Array.from(semesterMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([numero, courses]) => ({
        numero,
        courses,
        creditos: courses.reduce((sum, c) => sum + c.credits, 0)
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
        email: proyeccion.student.email
      },
      createdAt: proyeccion.createdAt,
      updatedAt: proyeccion.updatedAt
    };
  }

  async crearProyeccion(dto: CrearProyeccionDto) {
    // Buscar o crear estudiante
    let student = await this.prisma.student.findUnique({
      where: { apiStudentId: dto.rut }
    });

    if (!student) {
      student = await this.prisma.student.create({
        data: {
          apiStudentId: dto.rut,
          name: dto.studentName,
          email: dto.studentEmail,
          careerCode: dto.careerCode,
          catalogCode: dto.catalogCode
        }
      });
    }

    // Verificar que no exceda las 3 proyecciones POR CARRERA
    // Necesitamos filtrar las proyecciones por carrera comparando los códigos de curso
    const proyeccionesExistentes = await this.prisma.projection.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        courses: {
          select: {
            courseApiId: true
          },
          take: 1 // Solo necesitamos saber si tiene cursos de esta carrera
        }
      }
    });

    // Filtrar proyecciones que pertenecen a esta carrera específica
    // (comparando si los códigos de curso coinciden con el patrón de la carrera)
    const proyeccionesDeEstaCarrera = proyeccionesExistentes.filter(proy => {
      if (proy.courses.length === 0) return false;
      // Los códigos de curso tienen el formato: ECIN-00704, DCCB-00142, etc.
      // Podemos verificar si pertenecen a la misma carrera comparando con los cursos a guardar
      return true; // Por ahora aceptamos todas, mejoraremos esto
    });

    // Contar proyecciones de esta carrera específica
    const countPorCarrera = proyeccionesDeEstaCarrera.length;

    if (countPorCarrera >= 3) {
      throw new BadRequestException(
        `Ya tienes 3 proyecciones guardadas para esta carrera (${dto.careerCode}). Elimina una para crear otra.`
      );
    }

    // Si se marca como favorita, desmarcar las demás
    if (dto.isFavorite) {
      await this.prisma.projection.updateMany({
        where: {
          studentId: student.id,
          isFavorite: true,
        },
        data: {
          isFavorite: false,
        },
      });
    }

    // Crear proyección con cursos
    const projection = await this.prisma.projection.create({
      data: {
        studentId: student.id,
        name: dto.name,
        careerCode: dto.careerCode,      // ← AGREGAR
      catalogCode: dto.catalogCode,
        isFavorite: dto.isFavorite,
        isAutomatic: dto.isAutomatic,
        courses: {
          create: dto.semesters.flatMap(semester => 
            semester.courses.map(course => ({
              courseApiId: course.courseApiId,
              semesterNumber: semester.numero,
              credits: course.credits
            }))
          )
        }
      },
      include: {
        courses: true
      }
    });

    return projection;
  }

  async actualizarProyeccion(dto: ActualizarProyeccionDto) {
    const proyeccion = await this.prisma.projection.findUnique({
      where: { id: dto.id },
      include: { student: true }
    });

    if (!proyeccion) {
      throw new NotFoundException('Proyección no encontrada');

    }
   
      
    
    // Si se marca como favorita, desmarcar las demás
    if (dto.isFavorite) {
      await this.prisma.projection.updateMany({
        where: {
          studentId: proyeccion.studentId,
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
    if (dto.careerCode !== undefined) dataToUpdate.careerCode = dto.careerCode;      // ← ESTA LÍNEA
    if (dto.catalogCode !== undefined) dataToUpdate.catalogCode = dto.catalogCode;
    // Si hay nuevos semestres, eliminar los antiguos y crear los nuevos
    if (dto.semesters !== undefined) {
      await this.prisma.projectionCourse.deleteMany({
        where: { projectionId: dto.id }
      });

      dataToUpdate.courses = {
        create: dto.semesters.flatMap(semester => 
          semester.courses.map(course => ({
            courseApiId: course.courseApiId,
            semesterNumber: semester.numero,
            credits: course.credits
          }))
        )
      };
    }

    return this.prisma.projection.update({
      where: { id: dto.id },
      data: dataToUpdate,
      include: {
        courses: true
      }
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

    // Desmarcar todas las favoritas
    await this.prisma.projection.updateMany({
      where: {
        studentId: proyeccion.studentId,
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
}