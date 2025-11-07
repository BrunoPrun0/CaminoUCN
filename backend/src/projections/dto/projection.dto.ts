// src/projections/dto/projection.dto.ts
import { IsString, IsBoolean, IsArray, IsNotEmpty, ValidateNested, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CourseInSemesterDto {
  @IsString()
  @IsNotEmpty()
  courseApiId: string;

  @IsNumber()
  @Min(0)
  credits: number;
}

export class SemesterDto {
  @IsNumber()
  @Min(1)
  numero: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseInSemesterDto)
  courses: CourseInSemesterDto[];
}

export class CrearProyeccionDto {
  @IsString()
  @IsNotEmpty()
  rut: string; // apiStudentId

  @IsString()
  @IsNotEmpty()
  careerCode: string;

  @IsString()
  @IsNotEmpty()
  catalogCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  studentName?: string;

  @IsOptional()
  @IsString()
  studentEmail?: string;

  @IsBoolean()
  isFavorite: boolean;

  @IsBoolean()
  isAutomatic: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SemesterDto)
  semesters: SemesterDto[];
}

export class ActualizarProyeccionDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SemesterDto)
  semesters?: SemesterDto[];
}