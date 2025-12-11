// correr test
// npm test proyeccionAutomatica.test.ts
import { describe, it, expect } from 'vitest';
import { calcularProyeccionAutomatica, puedeAgregarAsignatura } from './proyeccionAutomatica';

describe('proyeccionAutomatica', () => {
  const asignaturasMock = [
    { codigo: 'MAT100', asignatura: 'Cálculo I', creditos: 10, estado: 'NO CURSADA', nivel: 1, prereq: [], veces_cursado: 0 },
    { codigo: 'FIS100', asignatura: 'Física I', creditos: 10, estado: 'NO CURSADA', nivel: 1, prereq: ['MAT100'], veces_cursado: 0 },
    { codigo: 'PRO200', asignatura: 'Programación', creditos: 12, estado: 'NO CURSADA', nivel: 2, prereq: ['MAT100', 'FIS100'], veces_cursado: 0 },
    { codigo: 'ALG100', asignatura: 'Álgebra', creditos: 10, estado: 'APROBADO', nivel: 1, prereq: [], veces_cursado: 1 },
    { codigo: 'QUI100', asignatura: 'Química', creditos: 8, estado: 'NO CURSADA', nivel: 1, prereq: [], veces_cursado: 0 },
    { codigo: 'EST200', asignatura: 'Estadística', creditos: 10, estado: 'NO CURSADA', nivel: 2, prereq: ['MAT100'], veces_cursado: 0 },
  ];

  describe('calcularProyeccionAutomatica', () => {
    it('should return empty array when all courses are approved', () => {
      const todasAprobadas = asignaturasMock.map(a => ({ ...a, estado: 'APROBADO' }));
      
      const result = calcularProyeccionAutomatica(todasAprobadas);
      
      expect(result).toEqual([]);
    });

    it('should create semesters respecting prerequisites', () => {
      const result = calcularProyeccionAutomatica(asignaturasMock);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].asignaturas).toContain('MAT100');
      
      const semesterWithFIS = result.find(s => s.asignaturas.includes('FIS100'));
      const semesterWithMAT = result.find(s => s.asignaturas.includes('MAT100'));
      
      if (semesterWithFIS && semesterWithMAT) {
        expect(semesterWithFIS.numero).toBeGreaterThanOrEqual(semesterWithMAT.numero);
      }
    });

    it('should respect max 32 credits per semester', () => {
      const result = calcularProyeccionAutomatica(asignaturasMock);
      
      result.forEach(semestre => {
        expect(semestre.creditos).toBeLessThanOrEqual(32);
      });
    });

    it('should prioritize courses with 3+ attempts', () => {
      const conReintentos = asignaturasMock.map(a => 
        a.codigo === 'MAT100' ? { ...a, veces_cursado: 3 } : a
      );
      
      const result = calcularProyeccionAutomatica(conReintentos);
      
      expect(result[0].asignaturas).toContain('MAT100');
    });

    it('should handle courses with invalid prerequisites', () => {
      const conPrereqInvalido = [
        { codigo: 'MAT100', asignatura: 'Cálculo', creditos: 10, estado: 'NO CURSADA', nivel: 1, prereq: ['XXX999'], veces_cursado: 0 },
      ];
      
      const result = calcularProyeccionAutomatica(conPrereqInvalido);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].asignaturas).toContain('MAT100');
    });

    it('should group courses by level when possible', () => {
      const result = calcularProyeccionAutomatica(asignaturasMock);
      
      expect(result.length).toBeGreaterThan(0);
      const primerSemestre = result[0];
      
      // Primer semestre debe tener cursos de nivel bajo
      primerSemestre.asignaturas.forEach(codigo => {
        const curso = asignaturasMock.find(a => a.codigo === codigo);
        if (curso) {
          expect(curso.nivel).toBeLessThanOrEqual(2);
        }
      });
    });

    it('should handle multiple courses without prerequisites', () => {
      const sinPrereq = [
        { codigo: 'MAT100', asignatura: 'Cálculo', creditos: 10, estado: 'NO CURSADA', nivel: 1, prereq: [], veces_cursado: 0 },
        { codigo: 'QUI100', asignatura: 'Química', creditos: 10, estado: 'NO CURSADA', nivel: 1, prereq: [], veces_cursado: 0 },
        { codigo: 'BIO100', asignatura: 'Biología', creditos: 10, estado: 'NO CURSADA', nivel: 1, prereq: [], veces_cursado: 0 },
      ];
      
      const result = calcularProyeccionAutomatica(sinPrereq);
      
      expect(result[0].creditos).toBe(30);
      expect(result[0].asignaturas.length).toBe(3);
    });

    it('should respect MAX_DISPERSION_NIVELES of 3', () => {
      const conNivelesVariados = [
        { codigo: 'N1', asignatura: 'Nivel 1', creditos: 5, estado: 'NO CURSADA', nivel: 1, prereq: [], veces_cursado: 0 },
        { codigo: 'N2', asignatura: 'Nivel 2', creditos: 5, estado: 'NO CURSADA', nivel: 2, prereq: [], veces_cursado: 0 },
        { codigo: 'N3', asignatura: 'Nivel 3', creditos: 5, estado: 'NO CURSADA', nivel: 3, prereq: [], veces_cursado: 0 },
        { codigo: 'N5', asignatura: 'Nivel 5', creditos: 5, estado: 'NO CURSADA', nivel: 5, prereq: [], veces_cursado: 0 },
      ];
      
      const result = calcularProyeccionAutomatica(conNivelesVariados);
      
      result.forEach(semestre => {
        const niveles = semestre.asignaturas.map(codigo => {
          const curso = conNivelesVariados.find(c => c.codigo === codigo);
          return curso ? curso.nivel : 0;
        });
        
        const maxNivel = Math.max(...niveles);
        const minNivel = Math.min(...niveles);
        expect(maxNivel - minNivel).toBeLessThanOrEqual(3);
      });
    });

    it('should prioritize failed courses (veces_cursado > 1)', () => {
      const conReprobados = [
        { codigo: 'MAT100', asignatura: 'Cálculo', creditos: 10, estado: 'NO CURSADA', nivel: 1, prereq: [], veces_cursado: 2 },
        { codigo: 'FIS100', asignatura: 'Física', creditos: 10, estado: 'NO CURSADA', nivel: 1, prereq: [], veces_cursado: 0 },
      ];
      
      const result = calcularProyeccionAutomatica(conReprobados);
      
      expect(result[0].asignaturas[0]).toBe('MAT100');
    });

    it('should handle courses with multiple levels', () => {
      const multinivel = [
        { codigo: 'N1', asignatura: 'Nivel 1', creditos: 10, estado: 'NO CURSADA', nivel: 1, prereq: [], veces_cursado: 0 },
        { codigo: 'N2', asignatura: 'Nivel 2', creditos: 10, estado: 'NO CURSADA', nivel: 2, prereq: ['N1'], veces_cursado: 0 },
        { codigo: 'N3', asignatura: 'Nivel 3', creditos: 10, estado: 'NO CURSADA', nivel: 3, prereq: ['N2'], veces_cursado: 0 },
      ];
      
      const result = calcularProyeccionAutomatica(multinivel);
      
      expect(result.length).toBe(3);
      expect(result[0].asignaturas).toContain('N1');
      expect(result[1].asignaturas).toContain('N2');
      expect(result[2].asignaturas).toContain('N3');
    });
  });

  describe('puedeAgregarAsignatura', () => {
    const semestresProyectados = [
      { numero: 1, asignaturas: ['MAT100'], creditos: 10 },
      { numero: 2, asignaturas: ['FIS100'], creditos: 10 },
    ];

    it('should allow adding course with fulfilled prerequisites', () => {
      const semestreDestino = { numero: 3, asignaturas: [], creditos: 0 };
      
      const result = puedeAgregarAsignatura(
        'PRO200',
        semestreDestino,
        asignaturasMock,
        semestresProyectados,
        3
      );
      
      expect(result.valido).toBe(true);
    });

    it('should reject adding course without prerequisites', () => {
      const semestreDestino = { numero: 1, asignaturas: [], creditos: 0 };
      
      const result = puedeAgregarAsignatura(
        'PRO200',
        semestreDestino,
        asignaturasMock,
        [],
        1
      );
      
      expect(result.valido).toBe(false);
      expect(result.razon).toContain('prerequisito');
    });

    it('should reject when exceeding 32 credits', () => {
      const semestreDestino = { numero: 1, asignaturas: ['MAT100', 'FIS100'], creditos: 30 };
      
      const asignaturaGrande = {
        codigo: 'XXX999',
        asignatura: 'Curso Grande',
        creditos: 15,
        estado: 'NO CURSADA',
        nivel: 1,
        prereq: [],
        veces_cursado: 0
      };
      
      const result = puedeAgregarAsignatura(
        'XXX999',
        semestreDestino,
        [...asignaturasMock, asignaturaGrande],
        [],
        1
      );
      
      expect(result.valido).toBe(false);
      expect(result.razon).toContain('Excede límite');
    });

    it('should reject adding already approved course', () => {
      const semestreDestino = { numero: 1, asignaturas: [], creditos: 0 };
      
      const result = puedeAgregarAsignatura(
        'ALG100',
        semestreDestino,
        asignaturasMock,
        [],
        1
      );
      
      expect(result.valido).toBe(false);
      expect(result.razon).toContain('Ya aprobaste');
    });

    it('should reject moving course before its dependents', () => {
      const semestresConDependientes = [
        { numero: 1, asignaturas: ['FIS100'], creditos: 10 },
        { numero: 2, asignaturas: ['MAT100'], creditos: 10 },
      ];
      
      const semestreDestino = { numero: 3, asignaturas: [], creditos: 0 };
      
      const result = puedeAgregarAsignatura(
        'MAT100',
        semestreDestino,
        asignaturasMock,
        semestresConDependientes,
        3
      );
      
      expect(result.valido).toBe(false);
      expect(result.razon).toContain('depende de esta asignatura');
    });

    it('should return error for non-existent course', () => {
      const semestreDestino = { numero: 1, asignaturas: [], creditos: 0 };
      
      const result = puedeAgregarAsignatura(
        'NOEXISTE',
        semestreDestino,
        asignaturasMock,
        [],
        1
      );
      
      expect(result.valido).toBe(false);
      expect(result.razon).toBe('Asignatura no encontrada');
    });

    it('should allow adding course with no prerequisites to any semester', () => {
      const semestreDestino = { numero: 5, asignaturas: [], creditos: 0 };
      
      const result = puedeAgregarAsignatura(
        'MAT100',
        semestreDestino,
        asignaturasMock,
        [],
        5
      );
      
      expect(result.valido).toBe(true);
    });

    it('should reject if course already in semester', () => {
      const semestreDestino = { numero: 1, asignaturas: ['MAT100'], creditos: 10 };
      
      const result = puedeAgregarAsignatura(
        'MAT100',
        semestreDestino,
        asignaturasMock,
        [],
        1
      );
      
      expect(result.valido).toBe(false);
      expect(result.razon).toContain('ya está en este semestre');
    });

    it('should check prerequisites are in previous semesters', () => {
      const semestresConPrereq = [
        { numero: 1, asignaturas: ['MAT100'], creditos: 10 },
        { numero: 2, asignaturas: [], creditos: 0 },
      ];
      
      const semestreDestino = { numero: 2, asignaturas: [], creditos: 0 };
      
      const result = puedeAgregarAsignatura(
        'FIS100',
        semestreDestino,
        asignaturasMock,
        semestresConPrereq,
        2
      );
      
      expect(result.valido).toBe(true);
    });

    it('should handle course with array of prerequisites', () => {
      const semestreDestino = { numero: 3, asignaturas: [], creditos: 0 };
      
      const semestresCompletos = [
        { numero: 1, asignaturas: ['MAT100'], creditos: 10 },
        { numero: 2, asignaturas: ['FIS100'], creditos: 10 },
      ];
      
      const result = puedeAgregarAsignatura(
        'PRO200',
        semestreDestino,
        asignaturasMock,
        semestresCompletos,
        3
      );
      
      expect(result.valido).toBe(true);
    });

    it('should validate dispersion of levels (MAX 3)', () => {
      const semestreDestino = { numero: 1, asignaturas: ['N1'], creditos: 5 };
      
      const cursosVariados = [
        { codigo: 'N1', asignatura: 'Nivel 1', creditos: 5, estado: 'NO CURSADA', nivel: 1, prereq: [], veces_cursado: 0 },
        { codigo: 'N5', asignatura: 'Nivel 5', creditos: 5, estado: 'NO CURSADA', nivel: 5, prereq: [], veces_cursado: 0 },
      ];
      
      const result = puedeAgregarAsignatura(
        'N5',
        semestreDestino,
        cursosVariados,
        [],
        1
      );
      
      expect(result.valido).toBe(false);
      expect(result.razon).toContain('Excede dispersión');
    });
  });
});