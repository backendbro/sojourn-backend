// export const FRONTEND_URL = 'http://localhost:4000';
export const FRONTEND_URL = 'https://sojourn.ng';
export const ACCESS_TOKEN = 'access_token';
export const ADMIN_TOKEN = 'x-office-token';
export const ADMIN_REFERESH_TOKEN = 'x-office-rtoken';
export const REFRESH_TOKEN = 'refresh_token';
export const ADMIN_ACCESS_TOKEN = 'so_access_token';
export const ADMIN_REFRESH_TOKEN = 'so_refresh_token';
export const HOST_ACCESS_TOKEN = 'host_access_token';
export const HOST_REFRESH_TOKEN = 'host_refresh_token';
export const HTTP_APP_STATE_PREFIX = 'x-sojourn-app';
export const IMAGE_STORAGE_URL_PREFIX = 'http://localhost:3000/';
export const CURRENT_ROLE_KEY = 'app_current_role';
export const PAYSTACK_TRANSACTION_INI_URL =
  'https://api.paystack.co/transaction/initialize';
export const CSRF_COOKIE_NAME = '__Host-psifi.x-csrf-token';

export const PAYSTACK_TRANSACTION_VERIFY_BASE_URL =
  'https://api.paystack.co/transaction/verify';

export const PAYSTACK_WEBHOOK_CRYPTO_ALGO = 'sha512';
export const PAYSTACK_WEBHOOK_SIGNATURE_KEY = 'x-paystack-signature';
export const PAYSTACK_SUCCESS_STATUS = 'success';

export const REFERAL_AMOUNT = 500;

export const SOJOURN_CREDITS_AMOUNT = 1000;

export const EARN_CREDITS_RATE = 0.02;

export const NOW_PAYMENTS_GET_CURRENCIES_URL =
  'https://api.nowpayments.io/v1/currencies?fixed_rate=true';

export const NOW_PAYMENTS_MINIMUM_AMOUNT_PAYABLE =
  'https://api.nowpayments.io/v1/min-amount?currency_from=usdttrc20&currency_to=btc&fiat_equivalent=usd&is_fee_paid_by_user=True';

export const NOW_PAYMENTS_CREATE_PAYMENT_URL =
  'https://api.nowpayments.io/v1/payment';

export const NOW_PAYMENTS_CONFIRMATION_URL =
  'https://api.nowpayments.io/v1/payment/';

export const CANCEL_SUBSCRIPTIONS_URL =
  'https://api.paystack.co/subscription/disable';

export const FETCH_SUBSCRIPTION_URL = 'https://api.paystack.co/subscription/';

export const INSPECTORS_PHOTO_DIR_NAME = 'inspectors';
