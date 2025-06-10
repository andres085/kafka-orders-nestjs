import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { HttpClientService } from '../http-client/http-client.service';
import { OrdersConsumerController } from '../orders-consumer/orders-consumer.controller';

describe('Consumer Integration Tests', () => {
  let app: TestingModule;
  let controller: OrdersConsumerController;
  let httpService: HttpService;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
      ],
      controllers: [OrdersConsumerController],
      providers: [HttpClientService],
    }).compile();

    controller = app.get<OrdersConsumerController>(OrdersConsumerController);
    httpService = app.get<HttpService>(HttpService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('End-to-End Order Processing', () => {
    const mockOrder = {
      id: '123',
      customerId: 'customer-456',
      items: [{ name: 'Product A', quantity: 2 }],
    };

    it('should process order end-to-end successfully', async () => {
      const mockApiResponse = { orderId: '123', status: 'created' };
      const mockAxiosResponse: AxiosResponse = {
        data: mockApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockAxiosResponse));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await controller.handleOrderEvent(mockOrder);

      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3003/orders',
        mockOrder,
      );
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

    it('should handle network failures end-to-end', async () => {
      const networkError = new Error('Network Error');
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => networkError));
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await controller.handleOrderEvent(mockOrder);

      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3003/orders',
        mockOrder,
      );
      expect(result).toEqual({
        success: false,
        error: 'Network Error',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith('Processing order: 123');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send order to Orders API:',
        'Network Error',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to process order 123:',
        'Network Error',
      );

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});
