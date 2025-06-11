import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OrdersConsumerController } from './consumers/orders-consumer.controller';
import { HttpClientService } from './handlers/http-client.service';

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
export class OrdersConsumerModule {}
