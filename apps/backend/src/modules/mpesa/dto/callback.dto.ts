export class MpesaCallbackItem {
  Name: string;
  Value?: string | number;
}

export class MpesaCallbackMetadata {
  Item: MpesaCallbackItem[];
}

export class MpesaStkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: MpesaCallbackMetadata;
}

export class MpesaCallbackBody {
  stkCallback: MpesaStkCallback;
}

export class MpesaCallbackDto {
  Body: MpesaCallbackBody;
}
