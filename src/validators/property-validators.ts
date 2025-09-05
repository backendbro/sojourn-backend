import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { PropertyTypes } from 'src/properties/types';

export class CreateInspectionRequestDTO {
  @IsUUID()
  hostId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  numberOfRooms: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  maxNumberOfPeople: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsNotEmptyObject()
  files: string[];

  @IsString()
  @IsNotEmpty()
  typeOfProperty: PropertyTypes;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsNumber()
  @IsNotEmpty()
  houseNumber: number;

  @IsString()
  @IsNotEmpty()
  zip: string;

  @IsString()
  @IsNotEmpty()
  lat: string;

  @IsString()
  @IsNotEmpty()
  lng: string;

  @IsArray()
  @IsNotEmptyObject()
  nearbyPlaces: string[];

  @IsArray()
  @IsNotEmptyObject()
  ammenities: string[];

  @IsArray()
  @IsNotEmptyObject()
  houseRules: string[];

  @IsString()
  @IsNotEmpty()
  checkInAfter: string;

  @IsString()
  @IsNotEmpty()
  checkOutBefore: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  cautionFee?: number;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsString()
  @IsNotEmpty()
  contactPhoneNumber: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsDateString()
  @IsNotEmpty()
  inspectionDate: Date;

  @IsString()
  @IsNotEmpty()
  inspectionTime: string;
}

export class CancelInspection {
  @IsUUID()
  inspectionId: string;
}
