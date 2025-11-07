-- CreateTable
CREATE TABLE "public"."students" (
    "id" SERIAL NOT NULL,
    "apiStudentId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "careerCode" TEXT,
    "catalogCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projections" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projection_courses" (
    "id" SERIAL NOT NULL,
    "projectionId" INTEGER NOT NULL,
    "courseApiId" TEXT NOT NULL,
    "semesterNumber" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projection_courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "students_apiStudentId_key" ON "public"."students"("apiStudentId");

-- CreateIndex
CREATE UNIQUE INDEX "projections_studentId_name_key" ON "public"."projections"("studentId", "name");

-- CreateIndex
CREATE INDEX "projection_courses_projectionId_semesterNumber_idx" ON "public"."projection_courses"("projectionId", "semesterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "projection_courses_projectionId_courseApiId_key" ON "public"."projection_courses"("projectionId", "courseApiId");

-- AddForeignKey
ALTER TABLE "public"."projections" ADD CONSTRAINT "projections_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."projection_courses" ADD CONSTRAINT "projection_courses_projectionId_fkey" FOREIGN KEY ("projectionId") REFERENCES "public"."projections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
