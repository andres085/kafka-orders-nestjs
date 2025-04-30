import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HttpClientService } from '../http-client/http-client.service';

@Controller()
export class OrdersConsumerController {
  constructor(private readonly httpClient: HttpClientService) {}

  @MessagePattern('orders-topic')
  async handleOrderEvent(@Payload() order: any) {
    console.log(`Processing order: ${order.id}`);

    try {
      const result = await this.httpClient.sendOrderToApi(order);
      console.log(`Order sent to API successfully: ${order.id}`);
      return { success: true, result };
    } catch (error) {
      console.error(`Failed to process order ${order.id}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}
