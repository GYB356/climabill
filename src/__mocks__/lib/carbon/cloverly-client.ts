// Mock implementation of the CloverlyClient
export class CloverlyClient {
  apiKey: string;

  constructor(apiKey: string = 'mock-api-key') {
    this.apiKey = apiKey;
  }

  // Mock methods
  calculateOffset = jest.fn().mockResolvedValue({
    id: 'offset-calculation-123',
    carbon_offset: {
      slug: 'carbon_offset',
      total_cost: {
        currency: 'USD',
        total: 25.0,
      },
      carbon_tonnes: 5.0,
    },
  });

  purchaseOffset = jest.fn().mockResolvedValue({
    id: 'purchase-123',
    status: 'completed',
    carbon_offset: {
      slug: 'carbon_offset',
      total_cost: {
        currency: 'USD',
        total: 25.0,
      },
      carbon_tonnes: 5.0,
    },
    project: {
      name: 'Wind Farm Project',
      type: 'renewable_energy',
      location: 'United States',
    },
    receipt_url: 'https://example.com/receipt/123',
  });

  getProjects = jest.fn().mockResolvedValue({
    data: [
      {
        id: 'project-1',
        name: 'Wind Farm Project',
        type: 'renewable_energy',
        location: 'United States',
        available_carbon_tonnes: 1000,
      },
      {
        id: 'project-2',
        name: 'Reforestation Project',
        type: 'forestry',
        location: 'Brazil',
        available_carbon_tonnes: 2000,
      },
    ],
  });

  getOffsetHistory = jest.fn().mockResolvedValue({
    data: [
      {
        id: 'purchase-123',
        status: 'completed',
        created_at: '2025-04-01T12:00:00Z',
        carbon_offset: {
          slug: 'carbon_offset',
          total_cost: {
            currency: 'USD',
            total: 25.0,
          },
          carbon_tonnes: 5.0,
        },
        project: {
          name: 'Wind Farm Project',
          type: 'renewable_energy',
          location: 'United States',
        },
      },
      {
        id: 'purchase-124',
        status: 'completed',
        created_at: '2025-03-01T12:00:00Z',
        carbon_offset: {
          slug: 'carbon_offset',
          total_cost: {
            currency: 'USD',
            total: 15.0,
          },
          carbon_tonnes: 3.0,
        },
        project: {
          name: 'Reforestation Project',
          type: 'forestry',
          location: 'Brazil',
        },
      },
    ],
  });
}
