// apps/multi-consumer/src/consumers/analytics-consumer/src/consumer/analytics-consumer.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AnalyticsHandler } from '../handlers/analytics-handler';

@Controller()
export class AnalyticsConsumerController {
  constructor(private readonly analyticsHandler: AnalyticsHandler) {}

  @MessagePattern('orders-topic')
  async handleOrderForAnalytics(@Payload() order: any) {
    console.log(
      `[Analytics Consumer] Processing order for analytics: ${order.id}`,
    );

    try {
      const result = await this.analyticsHandler.processOrderAnalytics(order);
      return { success: true, result };
    } catch (error) {
      console.error(
        `[Analytics Consumer] Error processing order ${order.id}:`,
        error.message,
      );
      return { success: false, error: error.message };
    }
  }

  @MessagePattern('analytics-topic')
  async handleDirectAnalytics(@Payload() analyticsData: any) {
    console.log(
      `[Analytics Consumer] Processing direct analytics data: ${analyticsData.type}`,
    );

    try {
      const result =
        await this.analyticsHandler.processAnalyticsData(analyticsData);
      return { success: true, result };
    } catch (error) {
      console.error(
        `[Analytics Consumer] Error processing analytics:`,
        error.message,
      );
      return { success: false, error: error.message };
    }
  }
}
