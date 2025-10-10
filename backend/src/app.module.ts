import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ApiExternaModule } from './api-externa/api-externa.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [PrismaModule, ApiExternaModule, StudentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
