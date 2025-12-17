import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('Conectando a la Base de Datos');
  app.enableCors({
    origin: '*', 
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
