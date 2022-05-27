import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
  UsePipes,
  Request,
} from '@nestjs/common';
import { BearerAuthGuard } from 'src/auth/bearer-auth.guard';
import { JoiValidationPipe } from 'src/pipes/JoiValidationPipe';
import { VError } from 'verror';
import { AlertsService } from './alerts.service';
import { CreateAlertRuleDto, CreateAlertRuleSchema } from './dto';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('createRule')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new JoiValidationPipe(CreateAlertRuleSchema))
  async createRule(@Request() req, @Body() dto: CreateAlertRuleDto) {
    try {
      return await this.alertsService.createRule(req.user, dto);
    } catch (e) {
      throw mapError(e);
    }
  }
}

function mapError(e: Error) {
  // TODO log in dev
  // console.error(e);
  switch (VError.info(e)?.code) {
    case 'PERMISSION_DENIED':
      return new ForbiddenException();
    // case 'BAD_ALERT':
    //   return new BadRequestException();
    // case 'NAME_CONFLICT':
    //   return new ConflictException('Name already exists');
    default:
      return e;
  }
}
