import { Test, TestingModule } from '@nestjs/testing';
import { ApiExternaController } from './api-externa.controller';
import { ApiExternaService } from './api-externa.service';
import { BadRequestException } from '@nestjs/common';

describe('ApiExternaController', () => {
  let controller: ApiExternaController;
  let service: ApiExternaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiExternaController],
      providers: [
        {
          provide: ApiExternaService,
          useValue: {
            getProgreso: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ApiExternaController>(ApiExternaController);
    service = module.get<ApiExternaService>(ApiExternaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProgreso', () => {
    it('should call service and return progreso data', async () => {
      const mockProgreso = {
        rut: '12345678-9',
        carrera: '100',
        catalogo: '2020',
        totalAsignaturas: 3,
        aprobadas: 2,
        reprobadas: 1,
      };

      jest
        .spyOn(service, 'getProgreso')
        .mockResolvedValueOnce(mockProgreso as any);

      const body = { codCarrera: '100', catalogo: '2020', rut: '12345678-9' };
      const result = await controller.getProgreso(body);

      expect(result).toEqual(mockProgreso);
      expect(service.getProgreso).toHaveBeenCalledWith(
        '100',
        '2020',
        '12345678-9',
      );
    });

    it('should throw BadRequestException when service fails', async () => {
      jest
        .spyOn(service, 'getProgreso')
        .mockRejectedValueOnce(new BadRequestException('Invalid carrera'));

      const body = { codCarrera: '999', catalogo: '2020', rut: '12345678-9' };

      await expect(controller.getProgreso(body)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should call service and return student data', async () => {
      const mockStudent = {
        rut: '12345678-9',
        nombre: 'Juan Pérez',
        email: 'juan@ucn.cl',
        carrera: '100',
      };

      jest.spyOn(service, 'login').mockResolvedValueOnce(mockStudent as any);

      const body = { email: 'juan@ucn.cl', password: 'password123' };
      const result = await controller.login(body);

      expect(result).toEqual(mockStudent);
      expect(service.login).toHaveBeenCalledWith('juan@ucn.cl', 'password123');
    });

    it('should throw BadRequestException on invalid credentials', async () => {
      jest
        .spyOn(service, 'login')
        .mockRejectedValueOnce(new BadRequestException('Invalid credentials'));

      const body = { email: 'juan@ucn.cl', password: 'wrongpassword' };

      await expect(controller.login(body)).rejects.toThrow(BadRequestException);
    });
  });
});
