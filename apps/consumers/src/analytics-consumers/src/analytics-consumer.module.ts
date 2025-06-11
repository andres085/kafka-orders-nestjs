import { Module } from '@nestjs/common';
import { AnalyticsConsumerController } from './consumers/analytics-consumer.controller';
import { AnalyticsHandler } from './handlers/analytics-handler';

@Module({
  controllers: [AnalyticsConsumerController],
  providers: [AnalyticsHandler],
  exports: [AnalyticsHandler],
})
export class AnalyticsConsumerModule {}
