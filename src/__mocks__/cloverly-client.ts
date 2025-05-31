export class CloverlyClient {
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async purchaseOffset(): Promise<any> {
    return {
      id: 'mock-offset-id',
      amount: 10,
      cost: 150,
      status: 'purchased',
      projectType: 'Renewable Energy',
      certificate: 'mock-certificate-url'
    };
  }

  async getOffsetProjects(): Promise<any[]> {
    return [
      {
        id: 'project-1',
        name: 'Wind Farm Project',
        type: 'Renewable Energy',
        pricePerTonne: 15
      },
      {
        id: 'project-2',
        name: 'Forest Conservation',
        type: 'Forestry',
        pricePerTonne: 12
      }
    ];
  }

  async calculateOffset(): Promise<any> {
    return {
      amount: 10,
      cost: 150,
      currency: 'USD'
    };
  }
}
