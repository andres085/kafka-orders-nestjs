import { Test, TestingModule } from '@nestjs/testing';
import { OrdersApiController } from './orders-api.controller';
import { OrdersApiService } from './orders-api.service';

describe('OrdersApiController', () => {
  let ordersApiController: OrdersApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrdersApiController],
      providers: [OrdersApiService],
    }).compile();

    ordersApiController = app.get<OrdersApiController>(OrdersApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(ordersApiController.getHello()).toBe('Hello World!');
    });
  });
});
