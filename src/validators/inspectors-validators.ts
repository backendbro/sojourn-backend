import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InspectorsDto {
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  firstName: string;
  @IsString()
  @IsNotEmpty()
  lastName: string;
  @IsString()
  @IsNotEmpty()
  photo: string;
  @IsNotEmpty()
  @IsString()
  address: string;
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}
