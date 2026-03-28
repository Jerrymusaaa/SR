import { registerAs } from '@nestjs/config';

export default registerAs('persona', () => ({
  apiKey: process.env.PERSONA_API_KEY,
  webhookSecret: process.env.PERSONA_WEBHOOK_SECRET,
  templateId: process.env.PERSONA_TEMPLATE_ID,
  environment: process.env.PERSONA_ENVIRONMENT || 'sandbox',
}));
