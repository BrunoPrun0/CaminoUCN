import { Test, TestingModule } from '@nestjs/testing';
import { ProjectionsController } from './projections.controller';
import { ProjectionsService } from './projections.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProjectionsController', () => {
  let controller: ProjectionsController;
  let service: ProjectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectionsController],
      providers: [
        {
          provide: ProjectionsService,
          useValue: {
            obtenerProyecciones: jest.fn(),
            obtenerProyeccion: jest.fn(),
            crearProyeccion: jest.fn(),
            actualizarProyeccion: jest.fn(),
            eliminarProyeccion: jest.fn(),
            marcarComoFavorita: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProjectionsController>(ProjectionsController);
    service = module.get<ProjectionsService>(ProjectionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('obtenerProyecciones', () => {
    it('should return all projections for a student', async () => {
      const mockProjections = [
        { id: 1, name: 'Proyección 1', isFavorite: true, semesters: [] },
        { id: 2, name: 'Proyección 2', isFavorite: false, semesters: [] },
      ];

      jest
        .spyOn(service, 'obtenerProyecciones')
        .mockResolvedValueOnce(mockProjections as any);

      const result = await controller.obtenerProyecciones('12345678-9', '100');

      expect(result).toEqual(mockProjections);
      expect(service.obtenerProyecciones).toHaveBeenCalledWith(
        '12345678-9',
        '100',
      );
    });

    it('should return empty array when no projections found', async () => {
      jest.spyOn(service, 'obtenerProyecciones').mockResolvedValueOnce([]);

      const result = await controller.obtenerProyecciones('12345678-9', '100');

      expect(result).toEqual([]);
    });
  });

  describe('obtenerProyeccion', () => {
    it('should return a single projection by id', async () => {
      const mockProjection = {
        id: 1,
        name: 'Mi Proyección',
        semesters: [{ numero: 1, courses: [], creditos: 20 }],
      };

      jest
        .spyOn(service, 'obtenerProyeccion')
        .mockResolvedValueOnce(mockProjection as any);

      const result = await controller.obtenerProyeccion(1);

      expect(result).toEqual(mockProjection);
      expect(service.obtenerProyeccion).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when projection not found', async () => {
      jest
        .spyOn(service, 'obtenerProyeccion')
        .mockRejectedValueOnce(
          new NotFoundException('Proyección no encontrada'),
        );

      await expect(controller.obtenerProyeccion(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('crearProyeccion', () => {
    it('should create a new projection', async () => {
      const createDto = {
        rut: '12345678-9',
        careerCode: '100',
        catalogCode: '2020',
        name: 'Nueva Proyección',
        isFavorite: false,
        isAutomatic: false,
        semesters: [
          {
            numero: 1,
            courses: [{ courseApiId: 'MAT100', credits: 10 }],
          },
        ],
      };

      const mockCreated = { id: 1, ...createDto };

      jest
        .spyOn(service, 'crearProyeccion')
        .mockResolvedValueOnce(mockCreated as any);

      const result = await controller.crearProyeccion(createDto as any);

      expect(result).toEqual(mockCreated);
      expect(service.crearProyeccion).toHaveBeenCalledWith(createDto);
    });

    it('should throw BadRequestException when max projections reached', async () => {
      const createDto = {
        rut: '12345678-9',
        careerCode: '100',
        catalogCode: '2020',
        name: 'Cuarta Proyección',
        isFavorite: false,
        isAutomatic: false,
        semesters: [],
      };

      jest
        .spyOn(service, 'crearProyeccion')
        .mockRejectedValueOnce(
          new BadRequestException('Ya tienes 3 proyecciones'),
        );

      await expect(
        controller.crearProyeccion(createDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('actualizarProyeccion', () => {
    it('should update an existing projection', async () => {
      const updateDto = {
        id: 1,
        name: 'Proyección Actualizada',
        isFavorite: true,
      };

      const mockUpdated = { ...updateDto, semesters: [] };

      jest
        .spyOn(service, 'actualizarProyeccion')
        .mockResolvedValueOnce(mockUpdated as any);

      const result = await controller.actualizarProyeccion(updateDto as any);

      expect(result).toEqual(mockUpdated);
      expect(service.actualizarProyeccion).toHaveBeenCalledWith(updateDto);
    });

    it('should throw NotFoundException when projection not found', async () => {
      const updateDto = { id: 999, name: 'No existe' };

      jest
        .spyOn(service, 'actualizarProyeccion')
        .mockRejectedValueOnce(
          new NotFoundException('Proyección no encontrada'),
        );

      await expect(
        controller.actualizarProyeccion(updateDto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminarProyeccion', () => {
    it('should delete a projection by id', async () => {
      const mockDeleted = {
        id: 1,
        name: 'Proyección Eliminada',
        studentId: 1,
        careerCode: '100',
        catalogCode: '2020',
        isFavorite: false,
        isAutomatic: false,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-10'),
      };

      jest
        .spyOn(service, 'eliminarProyeccion')
        .mockResolvedValueOnce(mockDeleted as any);

      const result = await controller.eliminarProyeccion(1);

      expect(result).toEqual(mockDeleted);
      expect(service.eliminarProyeccion).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when projection not found', async () => {
      jest
        .spyOn(service, 'eliminarProyeccion')
        .mockRejectedValueOnce(
          new NotFoundException('Proyección no encontrada'),
        );

      await expect(controller.eliminarProyeccion(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('marcarComoFavorita', () => {
    it('should mark projection as favorite', async () => {
      const mockMarked = { id: 1, isFavorite: true };

      jest
        .spyOn(service, 'marcarComoFavorita')
        .mockResolvedValueOnce(mockMarked as any);

      const result = await controller.marcarComoFavorita(1);

      expect(result).toEqual(mockMarked);
      expect(service.marcarComoFavorita).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when projection not found', async () => {
      jest
        .spyOn(service, 'marcarComoFavorita')
        .mockRejectedValueOnce(
          new NotFoundException('Proyección no encontrada'),
        );

      await expect(controller.marcarComoFavorita(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
