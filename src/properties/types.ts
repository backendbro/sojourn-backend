import { Inspectors } from 'src/inspectors/entities/inspectors.entity';

export type PropertyTypes = 'smart-share' | 'prime-inn' | 'town-house' | '';

export const PropertyInspectionStatusList = [
  'pending',
  'approved',
  'cancelled',
];

export enum PropertyInspectionStatus {
  PENDING,
  APPROVED,
  CANCELLED,
}

export enum PropertyStatus {
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
}

export interface CreateInspectionForm {
  hostId: string;
  title: string;
  numberOfRooms: number;
  description: string;
  photos: string[];
  maxNumberOfPeople: number;
  typeOfProperty: PropertyTypes;
  country: string;
  city: string;
  street: string;
  houseNumber: number;
  zip: string;
  lat: string;
  lng: string;
  nearbyPlaces: string[];
  ammenities: string[];
  houseRules: string[];
  checkInAfter: string;
  checkOutBefore: string;
  dateApproved?: Date;
  price: number;
  cautionFee?: number;
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
  inspectionDate: Date;
  inspectionTime: string;
  inspectorId?: string;
  inspector?: Inspectors;
  inspectionStatus?: string;
  status?: PropertyInspectionStatus;
}

export type PropertySearchQueriesKeys = {
  city: string;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  cursor: number;
  typesOfProperty: string;
  price: number;
  numberOfRooms: string;
  amenities: string;
};

export type PropertySearchQueriesKeysSql = {
  city: string;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  cursor: number;
  typesOfProperty: string[];
  price: number;
  numberOfRooms: string[];
  amenities: string[];
};

export interface CreateProperty {
  hostId: string;
  title: string;
  numberOfRooms: number;
  maxNumberOfPeople: number;
  description: string;
  photos: string[];
  typeOfProperty: PropertyTypes;
  country: string;
  city: string;
  street: string;
  houseNumber: number;
  zip: string;
  lat: string;
  lng: string;
  nearbyPlaces: string[];
  ammenities: string[];
  houseRules: string[];
  checkInAfter: string;
  checkOutBefore: string;
  price: number;
  cautionFee?: number;
  activeStatus?: PropertyStatus;
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
}

export type CheckListingAvailabilityType = {
  propertyId: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfInfants: number;
};
