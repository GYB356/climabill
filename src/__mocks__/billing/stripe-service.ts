// Mock implementation of the StripeService
export class StripeService {
  // Create mock functions for all methods
  createPaymentIntent = jest.fn().mockResolvedValue({
    clientSecret: 'mock_client_secret',
    amount: 250,
    currency: 'usd',
  });

  confirmPayment = jest.fn().mockResolvedValue({
    id: 'payment_123',
    status: 'succeeded',
    amount: 250,
    currency: 'usd',
  });

  getPaymentHistory = jest.fn().mockResolvedValue([
    {
      id: 'payment_123',
      status: 'succeeded',
      amount: 250,
      currency: 'usd',
      created: new Date('2025-04-01'),
      description: 'Carbon offset purchase',
    },
    {
      id: 'payment_124',
      status: 'succeeded',
      amount: 150,
      currency: 'usd',
      created: new Date('2025-03-01'),
      description: 'Carbon offset purchase',
    },
  ]);
}
