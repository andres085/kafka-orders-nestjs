import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { HttpClientService } from '../handlers/http-client.service';

describe('HttpClientService', () => {
  let service: HttpClientService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpClientService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HttpClientService>(HttpClientService);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOrderToApi', () => {
    const mockOrder = {
      id: '123',
      customerId: 'customer-456',
      items: [{ name: 'Product A', quantity: 2 }],
    };

    it('should successfully send order to API and return response data', async () => {
      const mockResponseData = { orderId: '123', status: 'created' };
      const mockAxiosResponse: AxiosResponse = {
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockAxiosResponse));

      const result = await service.sendOrderToApi(mockOrder);

      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3003/orders',
        mockOrder,
      );
      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponseData);
    });

    it('should handle HTTP errors and rethrow them', async () => {
      const mockError = new Error('Network error');
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => mockError));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.sendOrderToApi(mockOrder)).rejects.toThrow(
        'Network error',
      );

      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3003/orders',
        mockOrder,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to send order to Orders API:',
        'Network error',
      );

      consoleSpy.mockRestore();
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');
      jest
        .spyOn(httpService, 'post')
        .mockReturnValue(throwError(() => timeoutError));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(service.sendOrderToApi(mockOrder)).rejects.toThrow(
        'timeout of 5000ms exceeded',
      );

      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3003/orders',
        mockOrder,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to send order to Orders API:',
        'timeout of 5000ms exceeded',
      );

      consoleSpy.mockRestore();
    });

    it('should handle different order structures', async () => {
      const differentOrder = { id: '999', type: 'urgent' };
      const mockResponseData = { success: true };
      const mockAxiosResponse: AxiosResponse = {
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockAxiosResponse));

      const result = await service.sendOrderToApi(differentOrder);

      expect(httpService.post).toHaveBeenCalledWith(
        'http://localhost:3003/orders',
        differentOrder,
      );
      expect(result).toEqual(mockResponseData);
    });
  });
});
