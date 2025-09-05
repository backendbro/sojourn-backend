import { GENDER } from 'src/validators/user-validators';

export type AccountType = 'Individual' | 'Company';

export interface HostProfile {
  companyName: string;
  registrationNumber: string;
  vatNumber: string;
  country: string;
  state: string;
  city: string;
  street: string;
  houseNumber: number;
  postalCode: string;
  contactPersonPhoneNumber: string;
  contactPersonGender: GENDER;
}

export interface UserProfile {
  country: string;
  state: string;
  city: string;
  street: string;
  houseNumber: number;
  postalCode: string;
  phoneNumber: string;
  gender: GENDER;
}

export interface AccountCreation {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  refererId?: string;
  isGoogle?: boolean;
  isEmailVerified?: boolean;
}

export interface AccountCreatedEvent {
  code: string;
  id: string;
  email: string;
}

export interface PasswordResetEvent {
  otpCode: string;
  id: string;
  email: string;
  userFirstName: string;
}

export interface PasswordResetConfirmEvent {
  eventDate: string;
  email: string;
}

export interface HostAccountCreation {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  refererId?: string;
  accountType: AccountType;
  companyName?: string;
  registrationNumber?: string;
  vatNumber?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface GoogleLoginDto {
  email: string;
}

export interface JWTUser {
  id: string;
  email: string;
  role?: string;
}

export interface CreateRefereshTokenType {
  tokenId: string;
  refereshToken: string;
}
