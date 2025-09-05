import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class initializeTransactionDto {
  @IsOptional()
  @IsString()
  discountCode: string;
  @IsOptional()
  @IsNumber()
  credits: number;
  @IsUUID()
  propertyId: string;
  @IsUUID()
  userId: string;
  @IsDate()
  checkInDate: Date;
  @IsDate()
  checkOutDate: Date;
  @IsNumber()
  numberOfAdults: number;
  @IsNumber()
  numberOfChildren: number;
  @IsNumber()
  numberOfInfants: number;
}

export class InitializeSubscription {
  @IsString()
  @IsNotEmpty()
  planId: string;
  @IsString()
  @IsNotEmpty()
  planName: string;
  @IsUUID()
  hostId: string;
  @IsOptional()
  amount: number;
}
