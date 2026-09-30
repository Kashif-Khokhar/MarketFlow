export interface IPaymentService {
  createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<{ clientSecret: string, id: string }>;
  confirmPayment(paymentIntentId: string): Promise<boolean>;
  verifyWebhookSignature(payload: any, signature: string): boolean;
  processRefund(paymentIntentId: string, amount?: number): Promise<{ id: string, status: string }>;
}

export class MockPaymentAdapter implements IPaymentService {
  async createPaymentIntent(amount: number, currency: string, metadata?: any) {
    // In a real implementation with Stripe:
    // const paymentIntent = await stripe.paymentIntents.create({ amount, currency, metadata });
    // return { clientSecret: paymentIntent.client_secret, id: paymentIntent.id };

    console.log(`[MockPayment] Creating payment intent for ${amount} ${currency}`);
    
    // Simulating a Stripe response
    return {
      clientSecret: `mock_secret_${Date.now()}`,
      id: `pi_mock_${Date.now()}`
    };
  }

  async confirmPayment(paymentIntentId: string) {
    console.log(`[MockPayment] Confirming payment ${paymentIntentId}`);
    return true;
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    // In real Stripe: stripe.webhooks.constructEvent(payload, signature, secret)
    // For mock, just return true if signature exists
    return !!signature;
  }

  async processRefund(paymentIntentId: string, amount?: number) {
    console.log(`[MockPayment] Processing refund for ${paymentIntentId} (amount: ${amount || 'full'})`);
    return {
      id: `re_mock_${Date.now()}`,
      status: 'succeeded'
    };
  }
}

export const paymentService = new MockPaymentAdapter();
