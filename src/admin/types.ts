export enum ROLES {
  SUPER_ADMIN = 'super_admin',
  SUB_ADMIN = 'sub_admin',
}

export enum RATES {
  NAIRA_TO_DOLLAR = 'naira_to_dollar',
}

export interface IAdmin {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: ROLES;
}

export type AdminLoginType = {
  email: string;
  password: string;
};
