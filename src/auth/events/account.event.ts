import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AccountCreatedEvent,
  PasswordResetConfirmEvent,
  PasswordResetEvent,
} from '../types';
import { EmailServiceService } from 'src/email-service/email-service.service';
import { FRONTEND_URL } from 'src/constants';

@Injectable()
export class AccountCreationEventHandler {
  constructor(private emailService: EmailServiceService) {}

  @OnEvent('account.created')
  async handleAccountCreated(payload: AccountCreatedEvent) {
    await this.emailService.sendEmail(
      payload.email,
      'AccountEmailVerificationEmailTemplate',
      {
        email: payload.email,
        id: payload.id,
        code: payload.code,
        baseURL: FRONTEND_URL,
      },
    );
  }

  @OnEvent('password.reset')
  async handlePasswordReset(payload: PasswordResetEvent) {
    await this.emailService.sendEmail(
      payload.email,
      'PasswordResetRequestEmailTemplate',
      {
        userId: payload.id,
        userEmail: payload.email,
        otpCode: payload.otpCode,
        baseURL: FRONTEND_URL,
        userFirstName: payload.userFirstName,
      },
    );
  }

  @OnEvent('password.confirm')
  async handlePasswordResetConfirm(payload: PasswordResetConfirmEvent) {
    await this.emailService.sendEmail(
      payload.email,
      'PasswordResetEmailTemplate',
      {
        eventDate: payload.eventDate,
      },
    );
  }
}
