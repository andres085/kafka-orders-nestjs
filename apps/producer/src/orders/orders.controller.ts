import { Body, Controller, Post } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Post()
  async createOrder(@Body() orderData: any) {
    const enrichedOrder = {
      ...orderData,
      id: orderData.id ?? `order-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    await this.kafkaService.sendOrderEvent(enrichedOrder);

    return {
      success: true,
      message: 'Order sent to processing queue',
      orderId: enrichedOrder.id,
    };
  }
}
