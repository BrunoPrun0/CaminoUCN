// comando para test
// npm run test -- --coverage api-externa.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ApiExternaService } from './api-externa.service';

describe('ApiExternaService', () => {
  let service: ApiExternaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiExternaService],
    }).compile();

    service = module.get<ApiExternaService>(ApiExternaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProgreso', () => {
    const mockMallaData = [
      {
        codigo: 'MAT100',
        asignatura: 'Cálculo I',
        creditos: 10,
        nivel: 1,
        prereq: '',
      },
      {
        codigo: 'FIS100',
        asignatura: 'Física I',
        creditos: 10,
        nivel: 1,
        prereq: 'MAT100',
      },
      {
        codigo: 'PRO200',
        asignatura: 'Programación',
        creditos: 12,
        nivel: 2,
        prereq: ['MAT100', 'FIS100'],
      },
    ];

    const mockAvanceData = [
      {
        course: 'MAT100',
        period: '2024-1',
        status: 'APROBADO',
        excluded: false,
      },
      {
        course: 'FIS100',
        period: '2024-1',
        status: 'REPROBADO',
        excluded: false,
      },
      {
        course: 'PRO200',
        period: '2024-2',
        status: 'APROBADO',
        excluded: false,
      },
    ];

    it('should fetch and combine malla and avance data', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ json: async () => mockMallaData })
        .mockResolvedValueOnce({ json: async () => mockAvanceData });

      const result = await service.getProgreso('100', '2020', '12345678-9');

      expect(result).toBeDefined();
      expect(result.rut).toBe('12345678-9');
      expect(result.carrera).toBe('100');
      expect(result.catalogo).toBe('2020');
      expect(result.totalAsignaturas).toBe(3);
      expect(result.aprobadas).toBe(2);
      expect(result.reprobadas).toBe(1);
    });

    it('should handle string prerequisites and convert to array', async () => {
      const mallaWithStringPrereq = [
        {
          codigo: 'FIS100',
          asignatura: 'Física I',
          creditos: 10,
          nivel: 1,
          prereq: 'MAT100, ALG100',
        },
      ];

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ json: async () => mallaWithStringPrereq })
        .mockResolvedValueOnce({ json: async () => [] });

      const result = await service.getProgreso('100', '2020', '12345678-9');

      expect(Array.isArray(result.progreso[0].prereq)).toBe(true);
      expect(result.progreso[0].prereq).toContain('MAT100');
    });

    it('should handle empty prerequisites', async () => {
      const mallaWithNoPrereq = [
        {
          codigo: 'MAT100',
          asignatura: 'Cálculo I',
          creditos: 10,
          nivel: 1,
          prereq: '',
        },
      ];

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ json: async () => mallaWithNoPrereq })
        .mockResolvedValueOnce({ json: async () => [] });

      const result = await service.getProgreso('100', '2020', '12345678-9');

      expect(result.progreso[0].prereq).toEqual([]);
    });

    it('should filter excluded inscriptions', async () => {
      const avanceWithExcluded = [
        {
          course: 'MAT100',
          period: '2024-1',
          status: 'APROBADO',
          excluded: false,
        },
        {
          course: 'FIS100',
          period: '2024-1',
          status: 'APROBADO',
          excluded: true,
        },
      ];

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ json: async () => mockMallaData })
        .mockResolvedValueOnce({ json: async () => avanceWithExcluded });

      const result = await service.getProgreso('100', '2020', '12345678-9');

      expect(result.progreso[1].estado).toBe('NO CURSADA');
    });

    it('should use most recent enrollment status', async () => {
      const multipleEnrollments = [
        {
          course: 'MAT100',
          period: '2024-1',
          status: 'APROBADO',
          excluded: false,
        },
        {
          course: 'MAT100',
          period: '2023-2',
          status: 'REPROBADO',
          excluded: false,
        },
      ];

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ json: async () => mockMallaData })
        .mockResolvedValueOnce({ json: async () => multipleEnrollments });

      const result = await service.getProgreso('100', '2020', '12345678-9');

      const mat100 = result.progreso.find((p) => p.codigo === 'MAT100');
      expect(mat100.estado).toBe('APROBADO');
    });

    it('should throw BadRequestException when malla API returns error', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        json: async () => ({ error: 'Carrera no encontrada' }),
      });

      await expect(
        service.getProgreso('999', '2020', '12345678-9'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when avance API returns error', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ json: async () => mockMallaData })
        .mockResolvedValueOnce({
          json: async () => ({ error: 'RUT no encontrado' }),
        });

      await expect(
        service.getProgreso('100', '2020', '99999999-9'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw Error on network failure', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.getProgreso('100', '2020', '12345678-9'),
      ).rejects.toThrow('Error al conectar con la API externa malla');
    });

    it('should count aprobadas and reprobadas correctly', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ json: async () => mockMallaData })
        .mockResolvedValueOnce({ json: async () => mockAvanceData });

      const result = await service.getProgreso('100', '2020', '12345678-9');

      expect(result.aprobadas).toBe(2);
      expect(result.reprobadas).toBe(1);
    });
  });

  describe('login', () => {
    const mockStudentData = {
      rut: '12345678-9',
      nombre: 'Juan Pérez',
      email: 'juan@ucn.cl',
      carrera: '100',
    };

    it('should successfully login and return student data', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        json: async () => mockStudentData,
      });

      const result = await service.login('juan@ucn.cl', 'password123');

      expect(result).toEqual(mockStudentData);
    });

    it('should throw BadRequestException when login returns error', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        json: async () => ({ error: 'Credenciales inválidas' }),
      });

      await expect(
        service.login('juan@ucn.cl', 'wrongpassword'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw Error on network failure', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'));

      await expect(service.login('juan@ucn.cl', 'password123')).rejects.toThrow(
        'Error al conectar con la API externa',
      );
    });
  });
});
