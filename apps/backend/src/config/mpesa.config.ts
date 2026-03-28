import { registerAs } from '@nestjs/config';

export default registerAs('mpesa', () => ({
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  passkey: process.env.MPESA_PASSKEY,
  shortcode: process.env.MPESA_SHORTCODE || '174379',
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
  callbackUrl: process.env.MPESA_CALLBACK_URL,
}));
