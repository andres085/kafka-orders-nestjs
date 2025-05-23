import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders-api.module';

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  await app.listen(3003);
  console.log('Orders API is running on: http://localhost:3003');
}
bootstrap();
