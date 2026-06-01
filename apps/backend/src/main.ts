import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Security headers ───────────────────────────────────────────────────
  app.use(helmet());

  // ─── CORS ───────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  // ─── Global prefix ──────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── Global validation pipe ─────────────────────────────────────────────
  // Automatically validates every incoming DTO using class-validator.
  // whitelist: strips unknown fields so clients can't send extra data.
  // forbidNonWhitelisted: throws 400 if unknown fields are sent.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,           // auto-converts plain objects to DTO classes
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`BuildConnect API running on http://localhost:${port}/api/v1`);
}

bootstrap();