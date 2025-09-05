export type CancelSubscriptionPayloadType = {
  status: boolean;
  message: string;
};

export type GetSubscriptionPayloadType = {
  status: boolean;
  data: {
    email_token: string;
  };
};
