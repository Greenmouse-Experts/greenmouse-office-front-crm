declare module "@paystack/inline-js" {
  interface TransactionResult {
    id: number;
    reference?: string;
    trxref?: string;
    message: string;
  }

  interface TransactionCallbacks {
    onSuccess?: (transaction: TransactionResult) => void;
    onCancel?: () => void;
    onError?: (error: { message: string }) => void;
  }

  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks?: TransactionCallbacks): unknown;
  }
}
