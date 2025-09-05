import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class ReviewDto {
  @IsUUID()
  bookingId: string;

  @IsNumber()
  rating: number;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsUUID()
  userId: string;
}
