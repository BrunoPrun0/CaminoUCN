import { Module } from '@nestjs/common';
import { ApiExternaController } from './api-externa.controller';
import { ApiExternaService } from './api-externa.service';

@Module({
  controllers: [ApiExternaController],
  providers: [ApiExternaService],
})
export class ApiExternaModule {}
