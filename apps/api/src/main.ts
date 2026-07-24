import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/http-exception.filter.js';

async function bootstrap() {
  // Check required env vars
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-me-in-production') {
    console.warn(
      '⚠️  JWT_SECRET not set or using default. Set a strong secret in production.\n' +
        '   Copy apps/api/.env.example to apps/api/.env and configure it.',
    );
  }

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('v1');

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe — transforms payloads and strips unknown props
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter — normalizes all errors to contract format
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  console.log(`✅ TerraCollect API running on http://${host}:${port}/v1`);
}

bootstrap();
