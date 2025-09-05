import { EmailTemplateContent } from '@aws-sdk/client-sesv2';
import * as fs from 'fs';

export const AccountEmailVerificationEmailTemplate: EmailTemplateContent = {
  Subject: 'Verify your email',
  Html: fs
    .readFileSync(
      './src/email-service/email-templates/AccountEmailVerificationEmailTemplate.html',
    )
    .toString(),
  Text: 'Security code {{code}}.',
};

export const PasswordResetRequestEmailTemplate: EmailTemplateContent = {
  Subject: 'Change your password',
  Html: fs
    .readFileSync(
      './src/email-service/email-templates/PasswordResetRequestEmailTemplate.html',
    )
    .toString(),
  Text: 'Security code {{otpCode}}',
};

export const PasswordResetEmailTemplate: EmailTemplateContent = {
  Subject: 'Your password changed',
  Html: fs
    .readFileSync(
      './src/email-service/email-templates/PasswordResetEmailTemplate.html',
    )
    .toString(),
  Text: 'Your password is changed!',
};

export const BookingConfirmationEmailTemplate: EmailTemplateContent = {
  Subject: 'Your booking is confirmed',
  Html: fs
    .readFileSync(
      './src/email-service/email-templates/BookingConfirmationEmailTemplate.html',
    )
    .toString(),
  Text: 'Your booking is confirmed!',
};

export const BookingRejectionEmailTemplate: EmailTemplateContent = {
  Subject: 'Your booking is rejected',
  Html: fs
    .readFileSync(
      './src/email-service/email-templates/BookingRejectionEmailTemplate.html',
    )
    .toString(),
  Text: 'Your booking is rejected!',
};

export const UpcomingBookingReminderEmailTemplate: EmailTemplateContent = {
  Subject: 'Get ready for your upcoming booking',
  Html: fs
    .readFileSync(
      './src/email-service/email-templates/UpcomingBookingReminderEmailTemplate.html',
    )
    .toString(),
  Text: 'Get ready for your upcoming booking!',
};
