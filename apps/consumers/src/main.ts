import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AnalyticsConsumerModule } from './analytics-consumers/src/analytics-consumer.module';
import { OrdersConsumerModule } from './order-consumers/src/orders-consumer.module';

async function bootstrap() {
  console.log('Starting multiple Kafka consumers...');

  const ordersConsumer =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      OrdersConsumerModule,
      {
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9093'],
          },
          consumer: {
            groupId: 'orders-consumer',
          },
        },
      },
    );

  const analyticsConsumer =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      AnalyticsConsumerModule,
      {
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9093'],
          },
          consumer: {
            groupId: 'analytics-consumer',
          },
        },
      },
    );

  await Promise.all([ordersConsumer.listen(), analyticsConsumer.listen()]);

  console.log('All Kafka consumers are listening:');
  console.log('- Orders Consumer (group: orders-consumer)');
  console.log('- Analytics Consumer (group: analytics-consumer)');
}
bootstrap();
