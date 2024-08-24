import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('1ESOR - Discord bot')
    .setDescription(
      'The Official Discord for the 1ESOR Software engineering class at FIAP',
    )
    .setVersion('1.0')
    .addTag('BOT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT, () => {
    Logger.log(`Api Running on port ${process.env.PORT}`);
  });
}

bootstrap();
