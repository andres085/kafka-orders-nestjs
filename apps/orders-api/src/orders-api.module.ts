import { Module } from '@nestjs/common';
import { OrdersController } from './orders-api.controller';
import { OrdersService } from './orders-api.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
