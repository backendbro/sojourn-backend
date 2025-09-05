export type EmailTemplate =
  | 'AccountEmailVerificationEmailTemplate'
  | 'PasswordResetEmailTemplate'
  | 'PasswordResetRequestEmailTemplate'
  | 'GuestBookingRejectionEmailTemplate'
  | 'GuestBookingConfirmationEmailTemplate'
  | 'HostBookingRejectionEmailTemplate'
  | 'HostBookingConfirmationEmailTemplate'
  | 'SubscriptionInvoiceCreatedEmailTemplate'
  | 'SubscriptionInvoicePaymentFailedEmailTemplate'
  | 'SubscriptionWillNotRenewEmailTemplate'
  | 'UpcomingBookingReminderEmailTemplate'
  | 'ContactUsEmailTemplate';

export interface AccountEmailVerificationEmailTemplateParams {
  id: string;
  email: string;
  code: string;
  baseURL: string;
}

export interface PasswordResetRequestEmailTemplateParams {
  userId: string;
  userEmail: string;
  otpCode: string;
  userFirstName: string;
  baseURL: string;
}

export interface PasswordResetEmailTemplateParams {
  eventDate: string;
}

export interface HostBookingConfirmationEmailTemplateParams
  extends BookingRejectionEmailTemplateParams {
  hostFullName: string;
  lodgingType: string;
  lodgingImage: string;
  lodgingTotalEarning: number;
  guestFullName: string;
  guestPhoneNumber: string;
  freeCancelDate: string;
  tenantFullName: string;
  lodgingBasePrice: number;
  lodgingPrice: number;
  serviceFeeAmount: number;
  damageFeeAmount: number;
  maintenanceFeeAmount: number;
  vatShareAmount: number;
  lodgingTotalPrice: number;
}

export interface HostBookingRejectionEmailTemplateParams
  extends BookingRejectionEmailTemplateParams {
  lodgingType: string;
  lodgingImage: string;
  guestFullName: string;
  guestPhoneNumber: string;
}

export interface GuestBookingConfirmationEmailTemplateParams
  extends BookingRejectionEmailTemplateParams {
  lodgingType: string;
  lodgingImage: string;
  hostFullName: string;
  hostPhoneNumber: string;
  freeCancelDate: string;
  tenantFullName: string;
  lodgingBasePrice: number;
  lodgingPrice: number;
  serviceFeeAmount: number;
  damageFeeAmount: number;
  maintenanceFeeAmount: number;
  vatShareAmount: number;
  lodgingTotalPrice: number;
}

export interface GuestBookingRejectionEmailTemplateParams
  extends BookingRejectionEmailTemplateParams {
  lodgingType: string;
  lodgingImage: string;
  hostFullName: string;
  hostPhoneNumber: string;
}

export interface BookingRejectionEmailTemplateParams {
  propertyRSId: string;
  lodgingCity: string;
  lodgingFullAddress: string;
  checkInDate: string;
  checkOutDate: string;
  email: string;
  hostPhoneNumber: string;
  lodgingDuration: number;
  audience: string;
}

// export interface BookingConfirmationEmailTemplateParams
//   extends BookingRejectionEmailTemplateParams {
//   tenantFullName: string;
//   lodgingBasePrice: number;
//   lodgingPrice: number;
//   serviceFeeAmount: number;
//   damageFeeAmount: number;
//   maintenanceFeeAmount: number;
//   vatShareAmount: number;
//   lodgingTotalPrice: number;
// }

export type UpcomingBookingReminderEmailTemplateParams = {
  freeCancelDate: string;
  hostFullName: string;
} & BookingRejectionEmailTemplateParams;

export type SubscriptionInvoiceCreatedEmailTemplateParams = {
  email: string;
  nextPaymentDate: string;
};

export type SubscriptionWillNotRenewEmailTemplateParams = {
  email: string;
  nextPaymentDate: string;
};

export type SubscriptionInvoicePaymentFailedEmailTemplate = {
  email: string;
};

export type ContactUsEmailTemplateParams = {
  from: string;
  fullName: string;
  message: string;
};

export type EmailTemplateVariables =
  | AccountEmailVerificationEmailTemplateParams
  | PasswordResetRequestEmailTemplateParams
  | PasswordResetEmailTemplateParams
  | HostBookingConfirmationEmailTemplateParams
  | HostBookingRejectionEmailTemplateParams
  | GuestBookingConfirmationEmailTemplateParams
  | GuestBookingRejectionEmailTemplateParams
  | UpcomingBookingReminderEmailTemplateParams
  | SubscriptionInvoiceCreatedEmailTemplateParams
  | SubscriptionInvoicePaymentFailedEmailTemplate
  | ContactUsEmailTemplateParams;
