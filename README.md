# >>  Proyecto Camino <<

**Camino** es una plataforma de gestión curricular diseñada específicamente para estudiantes que no siguen un avance lineal.

El sistema permite visualizar el progreso en la malla curricular de forma intuitiva, recibir sugerencias automáticas de asignaturas y simular escenarios futuros (proyecciones). El objetivo es reducir la incertidumbre y ayudar al estudiante a tomar decisiones óptimas sobre su carga académica, validando prerrequisitos y créditos disponibles en tiempo real.

---

---

## Arquitectura del Sistema

El proyecto sigue una arquitectura moderna separada en capas:

* **Backend (API REST):** Construido con **NestJS**, maneja la lógica de negocio, cálculos de proyección, seguridad y conexión a datos.
* **Frontend (Cliente Web):** Interfaz de usuario interactiva para la gestión visual de semestres y asignaturas.
* **Base de Datos:** **PostgreSQL** con modelado relacional gestionado por **Prisma ORM**.
* **Integración:** Módulo dedicado (`api-externa`) para la comunicación con servicios universitarios (Login/Malla).

---

## Stack Tecnológico

Herramientas y tecnologías utilizadas en el desarrollo:

### Backend & Persistencia
* **Framework:** NestJS (Node.js + TypeScript)
* **Base de Datos:** PostgreSQL
* **ORM:** Prisma (Schema Management & Migrations)
* **Testing:** Jest y Vitest
* **Validación:** DTOs

### Frontend & UI
* **Framework:** React
* **Estilos:** TailwindCSS
* **Cliente HTTP:** Fetch

### Herramientas de Calidad (QA)
* **Linter:** ESLint (Análisis estático de código)
* **Formatter:** Prettier (Consistencia de estilo)
* **CI/CD:** Scripts de automatización en `package.json`

---

## Evidencia de Calidad y Testing (QA)
*Sección requerida para la evaluación de Calidad de Software (Puntos I.A y III).*

### 1. Cobertura de Código (Unit Testing)
Evidencia del porcentaje de cobertura en servicios y controladores críticos (>80%).

![Reporte de Cobertura](docs/coverage-report.png)
### 2. Ejecución de Tests
Validación de que todos los casos de prueba unitarios pasan exitosamente.

![Tests Pasando](docs/test-pass.png)
### 3. Calidad de Código (Clean Code)
Reporte del Linter demostrando ausencia de "Deuda Técnica" (warnings/errors).

![Reporte Linter](docs/linter-clean.png)
---

## Requisitos Previos de Instalación

Asegúrate de tener instalado en tu entorno local:

1.  **Node.js** (v18 LTS o superior)
2.  **Git** (Control de versiones)
3.  **PostgreSQL** (Motor de base de datos) o **Docker Desktop**.

---

## Guía de Instalación y Despliegue

Sigue estos pasos para levantar el proyecto completo (Backend + Frontend).

### Paso 1: Configuración del Backend

1.  **Clonar el repositorio y entrar a la carpeta:**
    ```bash
    git clone <URL_DEL_REPO>
    cd <NOMBRE_PROYECTO>
    ```

2.  **Instalar dependencias del servidor:**
    ```bash
    cd backend && npm install
    ```

3.  **Configurar Variables de Entorno (.env):**
    Crea un archivo `.env` en la raíz del backend con las siguientes credenciales:
    ```env
    DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_db?schema=public"
    PORT=3000
    ```

4.  **Inicializar Base de Datos (Prisma):**
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Iniciar el Servidor:**
    ```bash
    npm run start:dev
    ```
    *El Backend estará disponible en: `http://localhost:3000`*

### Paso 2: Configuración del Frontend

1.  **Instalar dependencias del cliente:**
    Abrir una nueva terminal.
    ```bash
    cd frontend  
    npm install
    ```

2.  **Iniciar la Web:**
    ```bash
    npm run dev  
    ```
    *El Frontend estará disponible en: `http://localhost:XXXX`*

---

## Comandos de Testing (QA)

Para auditoría de código y ejecución de pruebas automatizadas:

| Comando (Backend) | Descripción |
| :--- | :--- |
| `npm run test` | Ejecuta los tests unitarios (*.spec.ts). |
| `npm run test:cov` | Genera reporte de cobertura de código (Coverage). |
| `npm run test:e2e` | Ejecuta tests de integración (End-to-End). |
| `npm run lint` | Ejecuta el análisis estático (busca errores de estilo). |

---

## Documentación de la API (Backend)

Principales Endpoints disponibles en el sistema:

### Módulo de Integración (`/api-externa`)
* `POST /api-externa/login`: Autenticación contra sistema universitario.
* `POST /api-externa/progreso`: Obtención de malla y estado académico.

### Módulo de Proyecciones (`/projections`)
* `GET /projections`: Listar proyecciones de un alumno.
* `POST /projections`: Crear nueva proyección (Manual o Automática).
* `GET /projections/:id`: Ver detalle de una proyección.
* `PUT /projections/:id/favorita`: Marcar proyección como favorita.

---

## Modelo de Datos

El sistema utiliza las siguientes entidades principales (Prisma Schema):

1.  **Student:** Información base del alumno (RUT, Carrera, Email).
2.  **Projection:** Cabecera de un escenario de planificación.
    * *Relación:* Un estudiante tiene N proyecciones.
3.  **ProjectionCourse:** Detalle de cursos asignados a una proyección específica.

---

**Equipo de Desarrollo:**
* Martin Ubilla B.
* Diego Parga M.
* Emily Volta M.

**Asignatura:** Proyecto Integrador de Software