import { Module } from '@nestjs/common';
import { NestfindGateway } from './websocket.gateway';

@Module({
  providers: [NestfindGateway],
  exports: [NestfindGateway],
})
export class WebsocketModule {}
