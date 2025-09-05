import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPostalCode,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserProfile } from 'src/auth/types';

export enum GENDER {
  MALE = 'male',
  FEMALE = 'female',
}

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  code: string;
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class ResendEmailConfirmationDto {
  @IsEmail()
  email: string;
}

export class PasswordResetDto {
  @IsEmail()
  email: string;
}

export class PasswordResetConfirmationDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AddressDto {
  @IsNotEmpty()
  country: string;

  @IsNotEmpty()
  stateOrRegion: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  street: string;

  @IsInt()
  houseNumber: number;

  @IsPhoneNumber()
  primaryPhoneNumber: string;

  @IsNotEmpty()
  @IsEnum(GENDER)
  gender: string;

  @IsDateString()
  dateOfBirth: Date;

  @IsNotEmpty()
  @IsPostalCode()
  zipOrPostal: string;
}

export class CreateAccountDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  profile?: UserProfile;

  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  password: string;
}

export class CreateAccountWithGoogleDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsBoolean()
  @IsOptional()
  isEmailVerified: boolean;

  @IsBoolean()
  @IsOptional()
  isGoogle: boolean;

  profile?: UserProfile;
}

export class AddWishListDto {
  @IsUUID()
  propertyId: string;

  @IsUUID()
  userId: string;
}

export class AddWithdrawalRequest {
  @IsUUID()
  refererId: string;
  @IsNumber()
  amount: number;
  @IsString()
  bankName?: string;
  @IsString()
  bankAccountNumber?: string;
  @IsUUID()
  userId: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  oldPassword: string;
}
