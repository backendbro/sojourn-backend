import { AccountType } from 'src/auth/types';

export type HostType = {
  firstName: string;
  lastName: string;
  email: string;
  accountType: AccountType;
};

export type HostProfileType = {
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
