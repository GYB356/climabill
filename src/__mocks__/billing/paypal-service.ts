// Mock implementation of the PayPalService
export class PayPalService {
  // Create mock functions for all methods
  createOrder = jest.fn().mockResolvedValue({
    id: 'order_123',
    status: 'CREATED',
    amount: 250,
    currency: 'USD',
  });

  captureOrder = jest.fn().mockResolvedValue({
    id: 'order_123',
    status: 'COMPLETED',
    amount: 250,
    currency: 'USD',
  });

  getOrderHistory = jest.fn().mockResolvedValue([
    {
      id: 'order_123',
      status: 'COMPLETED',
      amount: 250,
      currency: 'USD',
      created: new Date('2025-04-01'),
      description: 'Carbon offset purchase',
    },
    {
      id: 'order_124',
      status: 'COMPLETED',
      amount: 150,
      currency: 'USD',
      created: new Date('2025-03-01'),
      description: 'Carbon offset purchase',
    },
  ]);
}
