import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from '../orders-api.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new order', () => {
    const mockOrder = {
      name: 'Product 1',
      price: 19.99,
      quantity: 2,
    };

    const newOrder = service.create(mockOrder);

    const expectedId = `order-1`;

    expect(newOrder.id).toEqual(expectedId);
  });

  it('should get all the orders', () => {
    const mockOrderOne = {
      name: 'Product 1',
      price: 19.99,
      quantity: 2,
    };
    const mockOrderTwo = {
      name: 'Product 2',
      price: 29.99,
      quantity: 1,
    };
    const mockOrderThree = {
      name: 'Product 3',
      price: 9.99,
      quantity: 3,
    };

    service.create(mockOrderOne);
    service.create(mockOrderTwo);
    service.create(mockOrderThree);

    const orders = service.findAll();

    expect(orders.length).toEqual(3);
  });

  it('should get one order by id', () => {
    const mockOrderOne = {
      name: 'Product 1',
      price: 19.99,
      quantity: 2,
    };
    const mockOrderTwo = {
      name: 'Product 2',
      price: 29.99,
      quantity: 1,
    };
    const mockOrderThree = {
      name: 'Product 3',
      price: 9.99,
      quantity: 3,
    };

    service.create(mockOrderOne);
    service.create(mockOrderTwo);
    service.create(mockOrderThree);

    const foundOrder = service.findOne('order-2');

    expect(foundOrder).toEqual(mockOrderTwo);
  });

  it('should update one order by id', () => {
    const mockOrderOne = {
      name: 'Product 1',
      price: 19.99,
      quantity: 2,
    };

    service.create(mockOrderOne);

    const newOrderData = { name: 'Updated Product 1', price: 20 };

    const updatedOrder = service.update('order-1', newOrderData);

    expect(updatedOrder.name).toEqual(newOrderData.name);
    expect(updatedOrder.price).toEqual(newOrderData.price);
    expect(updatedOrder.updatedAt).toBeDefined();
  });

  it('should delete one order by id', () => {
    const mockOrderOne = {
      name: 'Product 1',
      price: 19.99,
      quantity: 2,
    };

    service.create(mockOrderOne);

    service.remove('order-1');

    const orders = service.findAll();

    expect(orders.length).toEqual(0);
  });

  it('should get the stats of the orders', () => {
    const mockOrderOne = {
      name: 'Product 1',
      price: 10,
      quantity: 2,
    };
    const mockOrderTwo = {
      name: 'Product 2',
      price: 20,
      quantity: 1,
    };
    const mockOrderThree = {
      name: 'Product 3',
      price: 5,
      quantity: 3,
    };

    service.create(mockOrderOne);
    service.create(mockOrderTwo);
    service.create(mockOrderThree);

    const { totalOrders, totalValue } = service.getStats();

    expect(totalOrders).toEqual(3);
    expect(totalValue).toEqual(35);
  });
});
