// comando para test
// npm run test projections.service.spec.ts -- --coverage
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProjectionsService } from './projections.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProjectionsService', () => {
  let service: ProjectionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectionsService,
        {
          provide: PrismaService,
          useValue: {
            student: {
              findUnique: jest.fn(),
              create: jest.fn(), // Added this
            },
            projection: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              updateMany: jest.fn(),
            },
            projectionCourse: {
              deleteMany: jest.fn(), 
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProjectionsService>(ProjectionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('obtenerProyecciones', () => {
    it('should return empty array when student not found', async () => {
      jest.spyOn(prisma.student, 'findUnique').mockResolvedValueOnce(null);

      const result = await service.obtenerProyecciones('12345678-9', '100');

      expect(result).toEqual([]);
    });

    it('should return projections grouped by semester', async () => {
      const mockStudent = {
        projections: [
          {
            id: 1,
            name: 'Proyección 1',
            isFavorite: true,
            isAutomatic: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            courses: [
              { courseApiId: 'MAT100', semesterNumber: 1, credits: 10 },
              { courseApiId: 'FIS100', semesterNumber: 1, credits: 10 },
              { courseApiId: 'PRO200', semesterNumber: 2, credits: 12 },
            ],
          },
        ],
      };

      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValueOnce(mockStudent as any);

      const result = await service.obtenerProyecciones('12345678-9', '100');

      expect(result).toHaveLength(1);
      expect(result[0].semesters).toBeDefined();
      expect(result[0].semesters.length).toBe(2);
      expect(result[0].semesters[0].creditos).toBe(20);
      expect(result[0].semesters[1].creditos).toBe(12);
    });
  });

  describe('obtenerProyeccion', () => {
    it('should throw NotFoundException when projection not found', async () => {
      jest.spyOn(prisma.projection, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.obtenerProyeccion(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return projection with grouped semesters', async () => {
      const mockProjection = {
        id: 1,
        name: 'Test Projection',
        isFavorite: true,
        isAutomatic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        courses: [
          { courseApiId: 'MAT100', semesterNumber: 1, credits: 10 },
          { courseApiId: 'FIS100', semesterNumber: 2, credits: 10 },
        ],
        student: {
          apiStudentId: '12345678-9',
          name: 'Juan',
          email: 'juan@ucn.cl',
        },
      };

      jest
        .spyOn(prisma.projection, 'findUnique')
        .mockResolvedValueOnce(mockProjection as any);

      const result = await service.obtenerProyeccion(1);

      expect(result.id).toBe(1);
      expect(result.semesters.length).toBe(2);
    });
  });

  describe('crearProyeccion', () => {
    const createDto = {
      rut: '12345678-9',
      careerCode: '100',
      catalogCode: '2020',
      name: 'New Projection',
      studentName: 'Juan Pérez',
      studentEmail: 'juan@ucn.cl',
      isFavorite: true,
      isAutomatic: false,
      semesters: [
        {
          numero: 1,
          courses: [
            { courseApiId: 'MAT100', credits: 10 },
            { courseApiId: 'FIS100', credits: 10 },
          ],
        },
      ],
    };

    it('should create new student if not exists', async () => {
      const mockNewStudent = {
        id: 1,
        apiStudentId: '12345678-9',
        name: 'Juan Pérez',
        email: 'juan@ucn.cl',
        careerCode: '100',
        catalogCode: '2020',
        rol: 'STUDENT'
      };

      const mockCreatedProjection = {
        id: 1,
        studentId: 1,
        name: 'New Projection',
        careerCode: '100',
        catalogCode: '2020',
        isFavorite: true,
        isAutomatic: false,
        courses: [
          { courseApiId: 'MAT100', semesterNumber: 1, credits: 10 },
          { courseApiId: 'FIS100', semesterNumber: 1, credits: 10 },
        ],
      };

      jest.spyOn(prisma.student, 'findUnique').mockResolvedValueOnce(null);
      jest
        .spyOn(prisma.student, 'create')
        .mockResolvedValueOnce(mockNewStudent as any);
      jest.spyOn(prisma.projection, 'count').mockResolvedValueOnce(0);
      jest
        .spyOn(prisma.projection, 'updateMany')
        .mockResolvedValueOnce({ count: 0 });
      jest
        .spyOn(prisma.projection, 'create')
        .mockResolvedValueOnce(mockCreatedProjection as any);

      const result = await service.crearProyeccion(createDto as any);

      expect(result).toBeDefined();
      expect(prisma.student.create).toHaveBeenCalledWith({
        data: {
          apiStudentId: '12345678-9',
          name: 'Juan Pérez',
          email: 'juan@ucn.cl',
          careerCode: '100',
          catalogCode: '2020',
        },
      });
    });

    it('should throw BadRequestException when max projections reached', async () => {
      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValueOnce({ id: 1 } as any);
      jest.spyOn(prisma.projection, 'count').mockResolvedValueOnce(3);

      await expect(service.crearProyeccion(createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should unmark other favorites when creating favorite', async () => {
      jest
        .spyOn(prisma.student, 'findUnique')
        .mockResolvedValueOnce({ id: 1 } as any);
      jest.spyOn(prisma.projection, 'count').mockResolvedValueOnce(1);
      jest
        .spyOn(prisma.projection, 'updateMany')
        .mockResolvedValueOnce({ count: 1 });
      jest
        .spyOn(prisma.projection, 'create')
        .mockResolvedValueOnce({ id: 2 } as any);

      await service.crearProyeccion(createDto as any);

      expect(prisma.projection.updateMany).toHaveBeenCalled();
    });
  });

  describe('actualizarProyeccion', () => {
    it('should throw NotFoundException when projection not found', async () => {
      jest.spyOn(prisma.projection, 'findUnique').mockResolvedValueOnce(null);

      await expect(
        service.actualizarProyeccion({ id: 999, name: 'Updated' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update projection name', async () => {
      jest.spyOn(prisma.projection, 'findUnique').mockResolvedValueOnce({
        id: 1,
        studentId: 1,
        careerCode: '100',
      } as any);
      jest.spyOn(prisma.projection, 'update').mockResolvedValueOnce({
        id: 1,
        name: 'Updated',
        courses: [],
      } as any);

      const result = await service.actualizarProyeccion({
        id: 1,
        name: 'Updated',
      } as any);

      expect(result).toBeDefined();
      expect(prisma.projection.update).toHaveBeenCalled();
    });
  });

  describe('eliminarProyeccion', () => {
    it('should throw NotFoundException when projection not found', async () => {
      jest.spyOn(prisma.projection, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.eliminarProyeccion(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete projection by id', async () => {
      jest
        .spyOn(prisma.projection, 'findUnique')
        .mockResolvedValueOnce({ id: 1 } as any);
      jest
        .spyOn(prisma.projection, 'delete')
        .mockResolvedValueOnce({ id: 1 } as any);

      await service.eliminarProyeccion(1);

      expect(prisma.projection.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('marcarComoFavorita', () => {
    it('should throw NotFoundException when projection not found', async () => {
      jest.spyOn(prisma.projection, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.marcarComoFavorita(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should mark projection as favorite', async () => {
      jest.spyOn(prisma.projection, 'findUnique').mockResolvedValueOnce({
        id: 1,
        studentId: 1,
        careerCode: '100',
      } as any);
      jest
        .spyOn(prisma.projection, 'updateMany')
        .mockResolvedValueOnce({ count: 0 });
      jest.spyOn(prisma.projection, 'update').mockResolvedValueOnce({
        id: 1,
        isFavorite: true,
      } as any);

      const result = await service.marcarComoFavorita(1);

      expect(result.isFavorite).toBe(true);
    });
  });
});
