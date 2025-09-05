export enum UserActiveStatus {
  ACTIVE = 'active',
  RESTRICTED = 'restricted',
}

export interface GuestAccountCreation {
  guest: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    primaryPhoneNumber: string;
    gender: string;
    dateOfBirth: Date;
  };
  guestProfile: {
    country: string;
    stateOrRegion: string;
    city: string;
    street: string;
    houseNumber: number;
    zipOrPostal: string;
  };
}

export interface LoginDto {
  email: string;
  password?: string;
}
export interface JWTUser {
  id: string;
  email: string;
}

export type UserType = {
  firstName: string;
  lastName: string;
  email: string;
};

export type UserProfileType = {
  country: string;
  state: string;
  city: string;
  street: string;
  houseNumber: number;
  zipOrPostal: string;
  governmentId: string;
  photo: string;
  dateOfBirth: Date;
};
