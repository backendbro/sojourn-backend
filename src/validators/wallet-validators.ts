import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class AddAccountDto {
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsString()
  @IsNotEmpty()
  bankAccountNumber: string;

  @IsUUID()
  @IsNotEmpty()
  hostId: string;
}

export class WithdrawDto {
  @IsUUID()
  @IsNotEmpty()
  walletId: string;
  @IsUUID()
  @IsNotEmpty()
  hostId: string;
  @IsNumber()
  amount: number;

  @IsUUID()
  @IsNotEmpty()
  accountId: string;
}

export class TransferSojournCreditsDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEmail()
  to: string;

  @IsNumber()
  amount: number;
}
