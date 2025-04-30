import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OrdersService } from './orders-api.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: any) {
    const order = this.ordersService.create(createOrderDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Order stored successfully',
      data: order,
    };
  }

  @Get()
  findAll() {
    const orders = this.ordersService.findAll();
    return {
      statusCode: HttpStatus.OK,
      data: orders,
    };
  }

  @Get('stats')
  getStats() {
    const stats = this.ordersService.getStats();
    return {
      statusCode: HttpStatus.OK,
      data: stats,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const order = this.ordersService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      data: order,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: any) {
    const updatedOrder = this.ordersService.update(id, updateOrderDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Order updated successfully',
      data: updatedOrder,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.ordersService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Order removed successfully',
    };
  }
}
