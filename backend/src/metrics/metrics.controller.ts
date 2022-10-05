import { Controller, Get, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../core/auth/basic-auth.guard';
import { PromethusInterceptor } from './prometheus_interceptor';

@Controller('/')
@UseGuards(BasicAuthGuard)
export class MetricsController {
  @Get('metrics')
  async metrics() {
    return await PromethusInterceptor.registry.metrics();
  }
}
