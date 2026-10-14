import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { requestLogger } from './common/middleware/request-logger.middleware.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: config.getOrThrow<string>('CORS_ORIGIN'),
    exposedHeaders: ['Location', 'Content-Disposition'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(requestLogger);

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Desafio Dev 1 - SENAI')
      .setDescription('API do estudo de caso')
      .setVersion('1.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, document);

  await app.listen(config.get<number>('PORT') ?? 3000);
}
await bootstrap();
