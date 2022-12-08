import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
  UsePipes,
  Request,
  HttpCode,
  BadRequestException,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BearerAuthGuard } from 'src/core/auth/bearer-auth.guard';
import { AppConfig } from 'src/config/validate';
import { assertUnreachable } from 'src/helpers';
import { ZodValidationPipe } from 'src/pipes/ZodValidationPipe';
import { VError } from 'verror';
import { AlertsService } from './alerts.service';
import { Alerts } from '@pc/common/types/alerts';
import { TooManyRequestsException } from './exception/tooManyRequestsException';
import { TelegramService } from './telegram/telegram.service';
import { Api } from '@pc/common/types/api';

@Controller('alerts')
export class AlertsController {
  private tgSecret?: string;
  constructor(
    private config: ConfigService<AppConfig>,
    private readonly alertsService: AlertsService,
    private readonly telegramService: TelegramService,
  ) {
    const telegramOptions = this.config.get('alerts.telegram', {
      infer: true,
    });
    this.tgSecret = telegramOptions?.secret;
  }

  @Post('createAlert')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Alerts.mutation.inputs.createAlert))
  async createAlert(
    @Request() req,
    @Body() dto: Api.Mutation.Input<'/alerts/createAlert'>,
  ): Promise<Api.Mutation.Output<'/alerts/createAlert'>> {
    try {
      const { rule, ...rest } = dto;
      switch (rule.type) {
        case 'TX_SUCCESS':
          return await this.alertsService.createTxSuccessAlert(
            req.user,
            rest,
            rule,
          );
        case 'TX_FAILURE':
          return await this.alertsService.createTxFailureAlert(
            req.user,
            rest,
            rule,
          );
        case 'FN_CALL':
          return await this.alertsService.createFnCallAlert(
            req.user,
            rest,
            rule,
          );
        case 'EVENT':
          return await this.alertsService.createEventAlert(
            req.user,
            rest,
            rule,
          );
        case 'ACCT_BAL_NUM':
        case 'ACCT_BAL_PCT':
          return await this.alertsService.createAcctBalAlert(
            req.user,
            rest,
            rule,
          );
        default:
          assertUnreachable(
            rule,
            (rule) =>
              (rule as Api.Mutation.Input<'/alerts/createAlert'>['rule']).type,
          );
      }
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('updateAlert')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Alerts.mutation.inputs.updateAlert))
  async updateAlert(
    @Request() req,
    @Body() { id, name, isPaused }: Api.Mutation.Input<'/alerts/updateAlert'>,
  ): Promise<Api.Mutation.Output<'/alerts/updateAlert'>> {
    try {
      return await this.alertsService.updateAlert(req.user, id, name, isPaused);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('listAlerts')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Alerts.query.inputs.listAlerts))
  async listAlerts(
    @Request() req,
    @Body()
    { projectSlug, environmentSubId }: Api.Query.Input<'/alerts/listAlerts'>,
  ): Promise<Api.Query.Output<'/alerts/listAlerts'>> {
    try {
      return await this.alertsService.listAlerts(
        req.user,
        projectSlug,
        environmentSubId,
      );
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('deleteAlert')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Alerts.mutation.inputs.deleteAlert))
  async deleteAlert(
    @Request() req,
    @Body() { id }: Api.Mutation.Input<'/alerts/deleteAlert'>,
  ): Promise<Api.Mutation.Output<'/alerts/deleteAlert'>> {
    try {
      return await this.alertsService.deleteAlert(req.user, id);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('getAlertDetails')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Alerts.query.inputs.getAlertDetails))
  async getAlertDetails(
    @Request() req,
    @Body() { id }: Api.Query.Input<'/alerts/getAlertDetails'>,
  ): Promise<Api.Query.Output<'/alerts/getAlertDetails'>> {
    try {
      return await this.alertsService.getAlertDetails(req.user, id);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('createDestination')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Alerts.mutation.inputs.createDestination))
  async createDestination(
    @Request() req,
    @Body() dto: Api.Mutation.Input<'/alerts/createDestination'>,
  ): Promise<Api.Mutation.Output<'/alerts/createDestination'>> {
    try {
      const { config, ...rest } = dto;
      switch (config.type) {
        case 'WEBHOOK':
          return await this.alertsService.createWebhookDestination(
            req.user,
            rest,
            config,
          );
        case 'EMAIL':
          return await this.alertsService.createEmailDestination(
            req.user,
            rest,
            config,
          );
        case 'TELEGRAM':
          return await this.alertsService.createTelegramDestination(
            req.user,
            rest,
          );
        default:
          assertUnreachable(
            config,
            (config) =>
              (
                config as Api.Mutation.Input<'/alerts/createDestination'>['config']
              ).type,
          );
      }
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('deleteDestination')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Alerts.mutation.inputs.deleteDestination))
  async deleteDestination(
    @Request() req,
    @Body() { id }: Api.Mutation.Input<'/alerts/deleteDestination'>,
  ): Promise<Api.Mutation.Output<'/alerts/deleteDestination'>> {
    try {
      return await this.alertsService.deleteDestination(req.user, id);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('listDestinations')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Alerts.query.inputs.listDestinations))
  async listDestinations(
    @Request() req,
    @Body() { projectSlug }: Api.Query.Input<'/alerts/listDestinations'>,
  ): Promise<Api.Query.Output<'/alerts/listDestinations'>> {
    try {
      return await this.alertsService.listDestinations(req.user, projectSlug);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('enableDestination')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Alerts.mutation.inputs.enableDestination))
  async enableDestination(
    @Request() req,
    @Body()
    { alert, destination }: Api.Mutation.Input<'/alerts/enableDestination'>,
  ): Promise<Api.Mutation.Output<'/alerts/enableDestination'>> {
    try {
      return await this.alertsService.enableDestination(
        req.user,
        alert,
        destination,
      );
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('disableDestination')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Alerts.mutation.inputs.disableDestination))
  async disableDestination(
    @Request() req,
    @Body()
    { alert, destination }: Api.Mutation.Input<'/alerts/disableDestination'>,
  ): Promise<Api.Mutation.Output<'/alerts/disableDestination'>> {
    try {
      return await this.alertsService.disableDestination(
        req.user,
        alert,
        destination,
      );
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('updateDestination')
  @UseGuards(BearerAuthGuard)
  @UsePipes(new ZodValidationPipe(Alerts.mutation.inputs.updateDestination))
  async updateDestination(
    @Request() req,
    @Body() dto: Api.Mutation.Input<'/alerts/updateDestination'>,
  ): Promise<Api.Mutation.Output<'/alerts/updateDestination'>> {
    try {
      const { config, ...rest } = dto;
      switch (config.type) {
        case 'WEBHOOK':
          return await this.alertsService.updateWebhookDestination(
            req.user,
            rest,
            config,
          );
        case 'EMAIL':
          return await this.alertsService.updateEmailDestination(
            req.user,
            rest,
          );
        case 'TELEGRAM':
          return await this.alertsService.updateTelegramDestination(
            req.user,
            rest,
          );
        default:
          assertUnreachable(
            config,
            (config) =>
              (
                config as Api.Mutation.Input<'/alerts/updateDestination'>['config']
              ).type,
          );
      }
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('verifyEmailDestination')
  @HttpCode(204)
  @UsePipes(
    new ZodValidationPipe(Alerts.mutation.inputs.verifyEmailDestination),
  )
  async verifyEmailDestination(
    @Body() { token }: Api.Mutation.Input<'/alerts/verifyEmailDestination'>,
  ): Promise<Api.Mutation.Output<'/alerts/verifyEmailDestination'>> {
    try {
      return await this.alertsService.verifyEmailDestination(token);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  // * Handler for Telegram bot, this is not an endpoint for the DevConsole frontend
  @Post('telegramWebhook')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(Alerts.mutation.inputs.telegramWebhook))
  async start(
    @Headers('X-Telegram-Bot-Api-Secret-Token') secret: string,
    @Body() body: Api.Mutation.Input<'/alerts/telegramWebhook'>,
  ): Promise<Api.Mutation.Output<'/alerts/telegramWebhook'>> {
    if (!this.tgSecret) {
      throw new ForbiddenException();
    }

    if (secret !== this.tgSecret) {
      throw new UnauthorizedException();
    }
    const { message } = body;
    if (message && message.text) {
      if (message.text.startsWith('/start')) {
        const startToken = message.text.split(' ')[1];
        if (startToken) {
          try {
            await this.telegramService.start(startToken, message.chat);
          } catch (e: any) {
            // TODO convert this when logging lib is merged
            console.error(e); // intentionally leaving this in until better logging is implemented
            switch (VError.info(e)?.code) {
              case 'BAD_TELEGRAM_TOKEN':
                await this.telegramService.sendMessage(
                  message.chat.id,
                  `This token doesn't seem to be valid. Please check your destination in Pagoda and try again`,
                );
                break;
              case 'BAD_TELEGRAM_TOKEN_EXPIRED':
                await this.telegramService.sendMessage(
                  // TODO direct user to rotate token once that functionality is available
                  message.chat.id,
                  // `This token is expired. Please obtain a new token on the Destination details page`,
                  `This token is expired. At the moment we do not support generating a new token. Please create a new destination`,
                );
                break;
              default:
                await this.telegramService.sendMessage(
                  message.chat.id,
                  `Sorry, something went wrong. Please try again later`,
                );
            }
            return;
          }
          await this.telegramService.sendMessage(
            message.chat.id,
            `This destination is ready to receive alerts!`,
          );
        } else {
          await this.telegramService.sendMessage(
            message.chat.id,
            `Please provide your setup token as follows:\n<pre>/start &lt;token&gt;</pre>`,
          );
        }
      } else {
        await this.telegramService.sendMessage(
          message.chat.id,
          'You can receive alerts here by setting up a Telegram destination in Pagoda. If you are trying to provide your setup token, please enter it as follows:\n<pre>/start &lt;token&gt;</pre>',
        );
      }
    }
  }

  @Post('resendEmailVerification')
  @HttpCode(204)
  @UseGuards(BearerAuthGuard)
  @UsePipes(
    new ZodValidationPipe(Alerts.mutation.inputs.resendEmailVerification),
  )
  async resendEmailVerification(
    @Request() req,
    @Body()
    { destinationId }: Api.Mutation.Input<'/alerts/resendEmailVerification'>,
  ): Promise<Api.Mutation.Output<'/alerts/resendEmailVerification'>> {
    try {
      return await this.alertsService.resendEmailVerification(
        req.user,
        destinationId,
      );
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('unsubscribeFromEmailAlert')
  @HttpCode(204)
  @UsePipes(
    new ZodValidationPipe(Alerts.mutation.inputs.unsubscribeFromEmailAlert),
  )
  async unsubscribeFromEmailAlert(
    @Body() { token }: Api.Mutation.Input<'/alerts/unsubscribeFromEmailAlert'>,
  ): Promise<Api.Mutation.Output<'/alerts/unsubscribeFromEmailAlert'>> {
    try {
      return await this.alertsService.unsubscribeFromEmailAlert(token);
    } catch (e: any) {
      throw mapError(e);
    }
  }

  @Post('rotateWebhookDestinationSecret')
  @HttpCode(200)
  @UseGuards(BearerAuthGuard)
  @UsePipes(
    new ZodValidationPipe(
      Alerts.mutation.inputs.rotateWebhookDestinationSecret,
    ),
  )
  async rotateWebhookDestinationSecret(
    @Request() req,
    @Body()
    {
      destinationId,
    }: Api.Mutation.Input<'/alerts/rotateWebhookDestinationSecret'>,
  ): Promise<Api.Mutation.Output<'/alerts/rotateWebhookDestinationSecret'>> {
    try {
      return await this.alertsService.rotateWebhookDestinationSecret(
        req.user,
        destinationId,
      );
    } catch (e: any) {
      throw mapError(e);
    }
  }
}

function mapError(e: Error) {
  // TODO log in dev
  // console.error(e);
  const errorInfo = VError.info(e);
  switch (errorInfo?.code) {
    case 'PERMISSION_DENIED':
      return new ForbiddenException();
    case 'BAD_DESTINATION':
    case 'BAD_ALERT':
    case 'BAD_TOKEN_EXPIRED':
      return new BadRequestException();
    case 'NOT_FOUND':
      return new BadRequestException(errorInfo.response);
    case 'TOO_MANY_REQUESTS':
      return new TooManyRequestsException();
    default:
      return e;
  }
}
