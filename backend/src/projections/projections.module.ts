import { Module } from '@nestjs/common';
import { ProjectionsController } from './projections.controller';
import { ProjectionsService } from './projections.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProjectionsController],
  providers: [ProjectionsService, PrismaService],
  exports: [ProjectionsService]
})
export class ProjectionsModule {}