import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AdminLoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

type ActiveStatus = 'active' | 'restricted';

export class UserActiveStatusValidDto {
  @IsNotEmpty()
  @IsString()
  activeStatus: ActiveStatus;
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class RateDto {
  @IsNumber()
  @IsNotEmpty()
  rate: number;
}
