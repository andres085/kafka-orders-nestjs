import { NestFactory } from '@nestjs/core';
import { ProducerModule } from './producer.module';

async function bootstrap() {
  const app = await NestFactory.create(ProducerModule);
  await app.listen(3001);
  console.log('Producer app is running on: http://localhost:3001');
}
bootstrap();
