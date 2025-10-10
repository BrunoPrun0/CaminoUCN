# CaminoUCN
Repositorio para software "Camino" de Proyecto integrador de Software. Permite proyectar tu "camino" o recorrido en la malla de alguna carrera de la UCN, tomando en cuenta ramos aprobados, créditos y requisitos. 


Guia de setup (ingles)
1. Install Prerequisite Software
a. Git
Download and install: https://git-scm.com/downloads
b. Node.js (includes npm)
Download and install Node.js v18 or higher: https://nodejs.org/en/download/
Verify installation:
c. Docker Desktop
Download and install: https://www.docker.com/products/docker-desktop/
Start Docker Desktop and ensure it’s running.
2. Clone the Repository
3. Project Structure Overview
infra — Docker and deployment files
backend — NestJS API with Prisma ORM
frontend — Vite + React frontend
docs — Documentation
4. Backend Setup (NestJS + Prisma + PostgreSQL)
a. Environment Variables
Check or edit .env for database settings.
b. Docker Compose
From the infra folder, run:
This will:
Pull the official Postgres image
Build the backend image (NestJS + Prisma)
Run migrations and generate Prisma client automatically
c. Prisma
Prisma is used for database access and migrations.
The Docker setup runs npx prisma generate automatically.
If you want to run migrations manually:
5. Frontend Setup (Vite + React + TailwindCSS)
a. Install Dependencies
b. Run the Frontend
The app will be available at http://localhost:5173 by default.
6. Technologies Used
Node.js — JavaScript runtime
npm — Node package manager
Docker — Containerization
Docker Compose — Multi-container orchestration
PostgreSQL — Database (Docker image: postgres:latest)
NestJS — Backend framework
Prisma — ORM for database access
Vite — Frontend build tool
React — Frontend library
TailwindCSS — CSS framework
7. Stopping and Cleaning Up
To stop all containers:
To remove all containers and volumes (including database data):
8. Extra: Useful Commands
Check Docker containers:
Access backend container shell:
Access Postgres container shell:
9. Troubleshooting
Make sure Docker Desktop is running before using Docker commands.
If ports 3000 (backend), 5432 (Postgres), or 5173 (frontend) are in use, stop other services or change the ports in configs.
If you change Prisma models, run migrations and regenerate the client.