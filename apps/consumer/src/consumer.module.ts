import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HttpClientService } from './http-client/http-client.service';
import { OrdersConsumerController } from './orders-consumer/orders-consumer.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [OrdersConsumerController],
  providers: [HttpClientService],
})
export class ConsumerModule {}
