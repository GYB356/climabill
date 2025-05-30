// Mock implementation of Firestore
const mockCollection = jest.fn().mockReturnThis();
const mockDoc = jest.fn().mockReturnThis();
const mockWhere = jest.fn().mockReturnThis();
const mockOrderBy = jest.fn().mockReturnThis();
const mockLimit = jest.fn().mockReturnThis();
const mockAdd = jest.fn().mockResolvedValue({ id: 'mock-id' });
const mockSet = jest.fn().mockResolvedValue(undefined);
const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockDelete = jest.fn().mockResolvedValue(undefined);
const mockGet = jest.fn().mockResolvedValue({
  exists: true,
  data: () => ({}),
  id: 'mock-id',
});

export const db = {
  collection: mockCollection,
  doc: mockDoc,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  add: mockAdd,
  set: mockSet,
  update: mockUpdate,
  delete: mockDelete,
  get: mockGet,
};

// Export the mocks for direct access in tests
export const mocks = {
  mockCollection,
  mockDoc,
  mockWhere,
  mockOrderBy,
  mockLimit,
  mockAdd,
  mockSet,
  mockUpdate,
  mockDelete,
  mockGet,
};
