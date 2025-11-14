import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('🔍 DATABASE_URL del backend:', process.env.DATABASE_URL);
  app.enableCors({
    origin: '*', // frontend
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();