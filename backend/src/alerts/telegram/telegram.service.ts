import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Destination, TelegramDestination } from 'generated/prisma/alerts';
import { DateTime } from 'luxon';
import { AppConfig } from 'src/config/validate';
import { VError } from 'verror';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TelegramService {
  private botApi: AxiosInstance;

  constructor(
    private config: ConfigService<AppConfig>,
    private prisma: PrismaService,
  ) {
    const botToken = this.config.get('alerts.telegram.botToken', {
      infer: true,
    });

    this.botApi = axios.create({
      baseURL: `https://api.telegram.org/bot${botToken}`,
    });
  }

  async start(
    startToken: TelegramDestination['startToken'],
    chatId: TelegramDestination['chatId'],
  ) {
    const destination = await this.prisma.telegramDestination.findUnique({
      where: {
        startToken,
      },
      select: {
        id: true,
        tokenExpiresAt: true,
      },
    });

    if (!destination) {
      throw new VError(
        { info: { code: 'BAD_TELEGRAM_TOKEN' } },
        'Telegram destination not found for start token',
      );
    }

    //check token expiry
    if (DateTime.now() > DateTime.fromJSDate(destination.tokenExpiresAt)) {
      throw new VError(
        { info: { code: 'BAD_TELEGRAM_TOKEN_EXPIRED' } },
        'Telegram start token expired',
      );
    }

    await this.prisma.telegramDestination.update({
      where: {
        id: destination.id,
      },
      data: {
        chatId,
        startToken: null,
        tokenExpiresAt: null,
      },
    });
  }

  async sendMessage(chat_id, text) {
    try {
      await this.botApi.post('/sendMessage', {
        chat_id,
        text,
        parse_mode: 'HTML',
      });
    } catch (e) {
      console.error(`Failed to send telegram message`, e);
    }
  }
}
