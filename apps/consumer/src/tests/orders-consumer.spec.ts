import { Test, TestingModule } from '@nestjs/testing';
import { HttpClientService } from '../http-client/http-client.service';
import { OrdersConsumerController } from '../orders-consumer/orders-consumer.controller';

describe('OrdersConsumerController', () => {
  let controller: OrdersConsumerController;
  let httpClientService: HttpClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersConsumerController],
      providers: [
        {
          provide: HttpClientService,
          useValue: {
            sendOrderToApi: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersConsumerController>(OrdersConsumerController);
    httpClientService = module.get<HttpClientService>(HttpClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleOrderEvent', () => {
    const mockOrder = {
      id: '123',
      customerId: 'customer-456',
      items: [{ name: 'Product A', quantity: 2 }],
    };

    it('should successfully process order and return success response', async () => {
      const mockApiResponse = { orderId: '123', status: 'created' };
      jest
        .spyOn(httpClientService, 'sendOrderToApi')
        .mockResolvedValue(mockApiResponse);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await controller.handleOrderEvent(mockOrder);

      expect(httpClientService.sendOrderToApi).toHaveBeenCalledWith(mockOrder);
      expect(httpClientService.sendOrderToApi).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        result: mockApiResponse,
      });
      expect(consoleSpy).toHaveBeenCalledWith('Processing order: 123');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Order sent to API successfully: 123',
      );

      consoleSpy.mockRestore();
    });

    it('should handle service errors and return error response', async () => {
      const mockError = new Error('API connection failed');
      jest
        .spyOn(httpClientService, 'sendOrderToApi')
        .mockRejectedValue(mockError);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await controller.handleOrderEvent(mockOrder);

      expect(httpClientService.sendOrderToApi).toHaveBeenCalledWith(mockOrder);
      expect(httpClientService.sendOrderToApi).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: false,
        error: 'API connection failed',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('Processing order: 123');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to process order 123:',
        'API connection failed',
      );

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle orders without id gracefully', async () => {
      const orderWithoutId = {
        customerId: 'customer-456',
        items: [{ name: 'Product A', quantity: 2 }],
      };
      const mockApiResponse = { status: 'created' };
      jest
        .spyOn(httpClientService, 'sendOrderToApi')
        .mockResolvedValue(mockApiResponse);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await controller.handleOrderEvent(orderWithoutId);

      expect(httpClientService.sendOrderToApi).toHaveBeenCalledWith(
        orderWithoutId,
      );
      expect(result).toEqual({
        success: true,
        result: mockApiResponse,
      });
      expect(consoleSpy).toHaveBeenCalledWith('Processing order: undefined');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Order sent to API successfully: undefined',
      );

      consoleSpy.mockRestore();
    });

    it('should handle timeout errors specifically', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');
      jest
        .spyOn(httpClientService, 'sendOrderToApi')
        .mockRejectedValue(timeoutError);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await controller.handleOrderEvent(mockOrder);

      expect(result).toEqual({
        success: false,
        error: 'timeout of 5000ms exceeded',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to process order 123:',
        'timeout of 5000ms exceeded',
      );

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should process different order structures correctly', async () => {
      const differentOrder = {
        id: '999',
        type: 'urgent',
        priority: 'high',
      };
      const mockApiResponse = { orderId: '999', status: 'processed' };
      jest
        .spyOn(httpClientService, 'sendOrderToApi')
        .mockResolvedValue(mockApiResponse);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await controller.handleOrderEvent(differentOrder);

      expect(httpClientService.sendOrderToApi).toHaveBeenCalledWith(
        differentOrder,
      );
      expect(result).toEqual({
        success: true,
        result: mockApiResponse,
      });
      expect(consoleSpy).toHaveBeenCalledWith('Processing order: 999');

      consoleSpy.mockRestore();
    });
  });
});
