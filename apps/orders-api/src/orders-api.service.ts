import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class OrdersService {
  private readonly orders: Map<string, any> = new Map();
  private orderCounter = 0;

  create(order: any) {
    order.id ??= `order-${++this.orderCounter}`;

    this.orders.set(order.id, order);

    return order;
  }

  findAll() {
    return Array.from(this.orders.values());
  }

  findOne(id: string) {
    const order = this.orders.get(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  update(id: string, updateOrderData: any) {
    if (!this.orders.has(id)) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const updatedOrder = {
      ...this.orders.get(id),
      ...updateOrderData,
      updatedAt: new Date().toISOString(),
    };

    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  remove(id: string) {
    if (!this.orders.has(id)) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    this.orders.delete(id);
  }

  getStats() {
    return {
      totalOrders: this.orders.size,
      totalValue: Array.from(this.orders.values()).reduce(
        (sum, order) => sum + (order.price ?? 0),
        0,
      ),
    };
  }
}
