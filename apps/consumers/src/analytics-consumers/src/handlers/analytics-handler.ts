// apps/multi-consumer/src/consumers/analytics-consumer/src/handler/analytics-handler.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsHandler {
  private readonly analyticsData: Map<string, any> = new Map();
  private readonly orderMetrics = {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    ordersByHour: new Map<string, number>(),
    topProducts: new Map<string, number>(),
  };

  async processOrderAnalytics(order: any) {
    console.log(`Processing analytics for order: ${order.id}`);

    this.orderMetrics.totalOrders++;
    this.orderMetrics.totalRevenue += parseFloat(order.totalAmount ?? 0);
    this.orderMetrics.averageOrderValue =
      this.orderMetrics.totalRevenue / this.orderMetrics.totalOrders;

    const orderHour = new Date().getHours().toString();
    const currentHourCount = this.orderMetrics.ordersByHour.get(orderHour) ?? 0;
    this.orderMetrics.ordersByHour.set(orderHour, currentHourCount + 1);

    if (order.products && Array.isArray(order.products)) {
      order.products.forEach((product: any) => {
        const currentCount = this.orderMetrics.topProducts.get(product.id) ?? 0;
        this.orderMetrics.topProducts.set(
          product.id,
          currentCount + (product.quantity ?? 1),
        );
      });
    }

    const analyticsEntry = {
      orderId: order.id,
      timestamp: new Date().toISOString(),
      metrics: { ...this.orderMetrics },
      orderData: order,
    };

    this.analyticsData.set(order.id, analyticsEntry);

    console.log(`[Analytics] Updated metrics:`, {
      totalOrders: this.orderMetrics.totalOrders,
      totalRevenue: this.orderMetrics.totalRevenue,
      averageOrderValue: this.orderMetrics.averageOrderValue,
    });

    return analyticsEntry;
  }

  async processAnalyticsData(analyticsData: any) {
    console.log(`Processing direct analytics data: ${analyticsData.type}`);

    switch (analyticsData.type) {
      case 'user-behavior':
        return this.processUserBehavior(analyticsData);
      case 'sales-report':
        return this.processSalesReport(analyticsData);
      case 'inventory-analytics':
        return this.processInventoryAnalytics(analyticsData);
      default:
        console.log(`Unknown analytics type: ${analyticsData.type}`);
        return { processed: false, reason: 'Unknown analytics type' };
    }
  }

  private processUserBehavior(data: any) {
    console.log(`Processing user behavior data for user: ${data.userId}`);
    return { processed: true, type: 'user-behavior', userId: data.userId };
  }

  private processSalesReport(data: any) {
    console.log(`Processing sales report for period: ${data.period}`);
    return { processed: true, type: 'sales-report', period: data.period };
  }

  private processInventoryAnalytics(data: any) {
    console.log(
      `Processing inventory analytics for product: ${data.productId}`,
    );

    return {
      processed: true,
      type: 'inventory-analytics',
      productId: data.productId,
    };
  }

  getOrderMetrics() {
    return {
      ...this.orderMetrics,
      ordersByHour: Object.fromEntries(this.orderMetrics.ordersByHour),
      topProducts: Object.fromEntries(this.orderMetrics.topProducts),
    };
  }

  getAllAnalyticsData() {
    return Array.from(this.analyticsData.values());
  }

  getAnalyticsForOrder(orderId: string) {
    return this.analyticsData.get(orderId);
  }
}
