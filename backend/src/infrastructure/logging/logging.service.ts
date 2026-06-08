import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggingService {
  log(message: string): void {
    console.log(`[NestFind] ${message}`);
  }
  error(message: string, trace?: string): void {
    console.error(`[NestFind] ${message}`, trace);
  }
}
