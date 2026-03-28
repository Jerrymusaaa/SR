export class PersonaWebhookDto {
  data: {
    type: string;
    id: string;
    attributes: {
      status: string;
      referenceId?: string;
      fields?: Record<string, any>;
    };
  };
}
