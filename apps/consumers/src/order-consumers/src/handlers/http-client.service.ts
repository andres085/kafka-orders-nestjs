import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpClientService {
  constructor(private readonly httpService: HttpService) {}

  async sendOrderToApi(order: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:3003/orders', order),
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send order to Orders API:', error.message);
      throw error;
    }
  }
}
