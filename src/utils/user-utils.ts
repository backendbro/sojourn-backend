type Referal = {
  amount: number;
  createdAt: Date;
  paymentType: string;
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

export type WishlistType = {
  id: string;
  userId: string;
  property: {
    title: string;
    city: string;
    id: string;
    country: string;
    price: number;
    photos: Array<string>;
    reviews: Array<{ rating: number }>;
  };
};

type AllUserType = {
  email: string;
  id: string;
  active: string;
  firstName: string;
  lastName: string;
  createdAt?: Date; // <-- added
  profile?: {
    photo?: string;
    country?: string;
    city?: string; // <-- added
    primaryPhoneNumber?: string;
  };
};

export function removeMissingValues(obj: { [x: string]: string }) {
  const keys = Object.keys(obj);
  const data = {};
  for (const key of keys) {
    if (obj[key] !== '' && obj[key] !== undefined) {
      // @ts-expect-error - keeping same simple behaviour as before
      data[key] = obj[key];
    }
  }
  return data;
}

export function calculateReferalBalance(data: Referal[]) {
  let balance = 0;
  data.forEach((d) => {
    balance += d.amount;
  });
  return balance < 0 ? 0 : balance;
}

export function transfromReferals(data: Referal[]) {
  return data.map((referal: Referal) => ({
    referalType: referal.paymentType,
    referalFirstName: referal.user?.firstName ? referal.user?.firstName : 'me',
    referalLastName: referal.user?.lastName ? referal.user?.lastName : 'me',
    amount: referal.amount,
    date: new Date(referal.createdAt).toDateString(),
    id: referal.id,
  }));
}

export function transformWishlist(data: WishlistType[]) {
  return data.map((d) => ({
    title: d.property.title,
    city: d.property.city,
    country: d.property.country,
    price: d.property.price,
    reviews: d.property.reviews,
    photos: d.property.photos,
    id: d.property.id,
    userId: d.userId,
  }));
}

export function transformUsers(users: AllUserType[]) {
  return users.map((user) => {
    const profileExists = !!user.profile;
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      active: user.active,
      // raw Date as returned from TypeORM; frontend can format as needed
      createdAt: user.createdAt ?? null,
      // flattened profile fields (safe fallbacks)
      photo: profileExists ? user.profile?.photo ?? '' : '',
      phoneNumber: profileExists ? user.profile?.primaryPhoneNumber ?? '' : '',
      country: profileExists ? user.profile?.country ?? '' : '',
      city: profileExists ? user.profile?.city ?? '' : '',
    };
  });
}
