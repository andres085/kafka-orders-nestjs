import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { OrdersController } from './orders/orders.controller';

@Module({
  imports: [KafkaModule],
  controllers: [OrdersController],
})
export class ProducerModule {}
