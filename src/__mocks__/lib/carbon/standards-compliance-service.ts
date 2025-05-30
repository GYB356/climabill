// Mock implementation of the StandardsComplianceService
import { StandardCompliance } from '../../../lib/carbon/types';

export class StandardsComplianceService {
  // Create mock functions for all methods
  setStandardCompliance = jest.fn().mockImplementation((compliance: Omit<StandardCompliance, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `compliance-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date();
    return Promise.resolve({
      id,
      ...compliance,
      createdAt: now,
      updatedAt: now,
    });
  });

  getStandardsCompliance = jest.fn().mockImplementation((organizationId: string) => {
    return Promise.resolve([
      {
        id: 'compliance-1',
        standardType: 'GHG Protocol',
        verificationDate: new Date('2024-01-15'),
        certificationBody: 'Carbon Trust',
        certificateUrl: 'https://example.com/certificates/ghg-protocol',
        expirationDate: new Date('2025-01-15'),
        organizationId,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'compliance-2',
        standardType: 'ISO 14064',
        verificationDate: new Date('2024-02-20'),
        certificationBody: 'Bureau Veritas',
        certificateUrl: 'https://example.com/certificates/iso-14064',
        expirationDate: new Date('2025-02-20'),
        organizationId,
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-02-20'),
      },
    ]);
  });

  getStandardCompliance = jest.fn().mockImplementation((id: string) => {
    return Promise.resolve({
      id,
      standardType: 'GHG Protocol',
      verificationDate: new Date('2024-01-15'),
      certificationBody: 'Carbon Trust',
      certificateUrl: 'https://example.com/certificates/ghg-protocol',
      expirationDate: new Date('2025-01-15'),
      organizationId: 'org-123',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    });
  });

  updateStandardCompliance = jest.fn().mockImplementation((id: string, compliance: Partial<StandardCompliance>) => {
    return Promise.resolve({
      id,
      ...compliance,
      updatedAt: new Date(),
    });
  });

  deleteStandardCompliance = jest.fn().mockResolvedValue(undefined);
}
