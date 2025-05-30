// Mock implementation of the CarbonOffsetService
import { OffsetDonation, OffsetProject, OffsetPurchase } from '../lib/carbon/types';

export class CarbonOffsetService {
  // Create mock functions for all methods
  calculateOffsetCost = jest.fn().mockResolvedValue({
    amount: 500,
    cost: 250,
    currency: 'USD',
  });

  getAvailableProjects = jest.fn().mockResolvedValue([
    {
      id: 'project-1',
      name: 'Renewable Energy Project',
      description: 'Wind and solar energy projects',
      costPerTon: 25,
      location: 'Global',
      type: 'Renewable Energy',
      verified: true,
      verificationStandard: 'Gold Standard',
    },
    {
      id: 'project-2',
      name: 'Reforestation Project',
      description: 'Planting trees in deforested areas',
      costPerTon: 30,
      location: 'Brazil',
      type: 'Forestry',
      verified: true,
      verificationStandard: 'Verified Carbon Standard',
    },
  ]);

  purchaseOffset = jest.fn().mockResolvedValue({
    id: 'offset-123',
    amount: 500,
    cost: 250,
    date: new Date(),
    projectId: 'project-1',
    projectName: 'Renewable Energy Project',
    status: 'completed',
    paymentMethod: 'credit_card',
  });

  getOffsetHistory = jest.fn().mockResolvedValue([
    {
      id: 'offset-123',
      amount: 500,
      cost: 250,
      date: new Date('2025-04-01'),
      projectId: 'project-1',
      projectName: 'Renewable Energy Project',
      status: 'completed',
      paymentMethod: 'credit_card',
    },
    {
      id: 'offset-124',
      amount: 300,
      cost: 150,
      date: new Date('2025-03-01'),
      projectId: 'project-2',
      projectName: 'Reforestation Project',
      status: 'completed',
      paymentMethod: 'paypal',
    },
  ]);

  getDonationOptions = jest.fn().mockResolvedValue([
    {
      id: 'donation-1',
      name: 'Climate Action Fund',
      description: 'Support various climate initiatives',
      minimumAmount: 10,
      suggestedAmounts: [10, 25, 50, 100],
      currency: 'USD',
    },
    {
      id: 'donation-2',
      name: 'Ocean Conservation',
      description: 'Protect marine ecosystems',
      minimumAmount: 5,
      suggestedAmounts: [5, 15, 30, 50],
      currency: 'USD',
    },
  ]);

  makeDonation = jest.fn().mockResolvedValue({
    id: 'donation-tx-123',
    amount: 50,
    donationId: 'donation-1',
    donationName: 'Climate Action Fund',
    date: new Date(),
    status: 'completed',
    paymentMethod: 'credit_card',
  });
}
