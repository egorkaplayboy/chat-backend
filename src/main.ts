import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtGuard } from './libs/guard/jwt.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const reflector = app.get(Reflector);

  const config = new DocumentBuilder()
    .setTitle('Chat app')
    .setVersion('1.0')
    .addTag('chat')
    .addBearerAuth({ bearerFormat: 'jwt', type: 'http', scheme: 'bearer' })
    .addSecurityRequirements('bearer')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );
  app.useGlobalGuards(new JwtGuard(reflector));

  await app.listen(3000);
}
bootstrap();
