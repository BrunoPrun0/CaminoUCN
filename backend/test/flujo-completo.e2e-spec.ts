import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Ciclo de Vida Completo: CRUD de Proyecciones (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let projectionId: number;

  const mockRut = '99.999.999-K';
  const mockCareerCode = 'ING-TEST-FULL';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // LIMPIEZA DE SEGURIDAD
    if (projectionId) {
      // Intentamos borrar si es que el test de borrar falló
      try {
        await prisma.projection.delete({ where: { id: projectionId } });
      } catch (e) {}
    }
    await app.close();
  });

  // 1. CREAR (POST)
  it('1. POST /projections - Crear proyección', async () => {
    const payload = {
      rut: mockRut,
      careerCode: mockCareerCode,
      careerName: 'Ingeniería Full Stack',
      catalogCode: '202410',
      name: 'Proyección Ciclo Completo',
      studentName: 'Tester E2E',
      studentEmail: 'test-full@ucn.cl',
      isFavorite: true,
      isAutomatic: false,
      semesters: [
        {
          numero: 1,
          courses: [{ courseApiId: 'TEST-FULL-1', nombre: 'Test Avanzado', credits: 5 }]
        }
      ]
    };

    const response = await request(app.getHttpServer())
      .post('/projections')
      .send(payload)
      .expect(201);

    projectionId = response.body.id;
    expect(response.body).toHaveProperty('id');
  });

  // 2. VERIFICAR ADMIN (GET Dashboard)
  it('2. GET /dashboard/stats - Verificar que el Admin la ve', async () => {
    const response = await request(app.getHttpServer())
      .get(`/projections/dashboard/stats?careerCode=${mockCareerCode}`)
      .expect(200);

    const ramo = response.body.find((r: any) => r.codigo === 'TEST-FULL-1');
    expect(ramo).toBeDefined();
    expect(ramo.interesados).toBeGreaterThanOrEqual(1);
  });

  // 3. LISTAR PROPIAS (GET List) - ¡NUEVO!
  it('3. GET /projections - El alumno puede ver su lista', async () => {
    const response = await request(app.getHttpServer())
      .get(`/projections?rut=${mockRut}&careerCode=${mockCareerCode}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    // Verificamos que la proyección creada esté en la lista
    const encontrada = response.body.find((p: any) => p.id === projectionId);
    expect(encontrada).toBeDefined();
    expect(encontrada.name).toBe('Proyección Ciclo Completo');
  });

  // 4. ELIMINAR (DELETE) - ¡NUEVO!
  it('4. DELETE /projections/:id - El alumno puede eliminarla', async () => {
    await request(app.getHttpServer())
      .delete(`/projections/${projectionId}`)
      .expect(200);

    // Confirmamos que ya no existe en la base de datos
    const buscar = await prisma.projection.findUnique({ where: { id: projectionId } });
    expect(buscar).toBeNull();
  });
});