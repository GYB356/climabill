// Mock Firestore implementation for testing

// Mock document data store
const mockDocuments = new Map<string, any>();

// Mock Timestamp
export class Timestamp {
  seconds: number;
  nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  toDate() {
    return new Date(this.seconds * 1000);
  }

  static now() {
    const now = new Date();
    return new Timestamp(Math.floor(now.getTime() / 1000), 0);
  }

  static fromDate(date: Date) {
    return new Timestamp(Math.floor(date.getTime() / 1000), 0);
  }
}

// Mock DocumentSnapshot
class DocumentSnapshot {
  private _exists: boolean;
  private _data: any;
  private _id: string;

  constructor(id: string, data: any) {
    this._id = id;
    this._data = data;
    this._exists = data !== undefined;
  }

  exists() {
    return this._exists;
  }

  data() {
    return this._data;
  }

  get id() {
    return this._id;
  }
}

// Mock QuerySnapshot
class QuerySnapshot {
  docs: DocumentSnapshot[];

  constructor(docs: DocumentSnapshot[]) {
    this.docs = docs;
  }

  get empty() {
    return this.docs.length === 0;
  }

  get size() {
    return this.docs.length;
  }
}

// Mock DocumentReference
class DocumentReference {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  collection(collectionPath: string) {
    return new CollectionReference(`${this.path}/${collectionPath}`);
  }

  get id() {
    return this.path.split('/').pop() || '';
  }

  async get() {
    const data = mockDocuments.get(this.path);
    return new DocumentSnapshot(this.id, data);
  }

  async set(data: any) {
    mockDocuments.set(this.path, data);
    return this;
  }

  async update(data: any) {
    const existingData = mockDocuments.get(this.path) || {};
    mockDocuments.set(this.path, { ...existingData, ...data });
    return this;
  }

  async delete() {
    mockDocuments.delete(this.path);
    return this;
  }
}

// Mock Query
class Query {
  protected path: string;
  protected filters: Array<{ field: string; operator: string; value: any }> = [];
  protected orders: Array<{ field: string; direction: 'asc' | 'desc' }> = [];
  protected limitValue: number | null = null;

  constructor(path: string) {
    this.path = path;
  }

  where(field: string, operator: string, value: any) {
    const newQuery = new Query(this.path);
    newQuery.filters = [...this.filters, { field, operator, value }];
    newQuery.orders = [...this.orders];
    newQuery.limitValue = this.limitValue;
    return newQuery;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    const newQuery = new Query(this.path);
    newQuery.filters = [...this.filters];
    newQuery.orders = [...this.orders, { field, direction }];
    newQuery.limitValue = this.limitValue;
    return newQuery;
  }

  limit(n: number) {
    const newQuery = new Query(this.path);
    newQuery.filters = [...this.filters];
    newQuery.orders = [...this.orders];
    newQuery.limitValue = n;
    return newQuery;
  }

  async get() {
    const prefix = `${this.path}/`;
    let docs = Array.from(mockDocuments.entries())
      .filter(([path]) => path.startsWith(prefix) && path.split('/').length === prefix.split('/').length)
      .map(([path, data]) => {
        const id = path.split('/').pop() || '';
        return new DocumentSnapshot(id, data);
      });

    // Apply filters
    this.filters.forEach(filter => {
      docs = docs.filter(doc => {
        const data = doc.data();
        if (!data) return false;
        
        const fieldValue = data[filter.field];
        switch (filter.operator) {
          case '==': return fieldValue === filter.value;
          case '!=': return fieldValue !== filter.value;
          case '>': return fieldValue > filter.value;
          case '>=': return fieldValue >= filter.value;
          case '<': return fieldValue < filter.value;
          case '<=': return fieldValue <= filter.value;
          case 'array-contains': return Array.isArray(fieldValue) && fieldValue.includes(filter.value);
          default: return true;
        }
      });
    });

    // Apply ordering
    if (this.orders.length > 0) {
      docs.sort((a, b) => {
        for (const order of this.orders) {
          const aData = a.data() || {};
          const bData = b.data() || {};
          const aValue = aData[order.field];
          const bValue = bData[order.field];
          
          if (aValue < bValue) return order.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return order.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply limit
    if (this.limitValue !== null) {
      docs = docs.slice(0, this.limitValue);
    }

    return new QuerySnapshot(docs);
  }
}

// Mock CollectionReference
class CollectionReference extends Query {
  constructor(path: string) {
    super(path);
  }

  doc(docPath: string = '') {
    const fullPath = docPath ? `${this.path}/${docPath}` : `${this.path}/${Math.random().toString(36).substring(2, 15)}`;
    return new DocumentReference(fullPath);
  }

  async add(data: any) {
    const docRef = this.doc();
    await docRef.set(data);
    return docRef;
  }
}

// Create mock functions for test assertions
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockGet = jest.fn();
const mockAdd = jest.fn();
const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

// Enhance the original classes to use the mock functions for assertions
class EnhancedDocumentReference extends DocumentReference {
  constructor(path: string) {
    super(path);
  }

  async get() {
    mockDoc(this.id);
    return super.get();
  }

  async set(data: any) {
    mockSet(data);
    return super.set(data);
  }

  async update(data: any) {
    mockUpdate(data);
    return super.update(data);
  }

  async delete() {
    mockDelete();
    return super.delete();
  }

  collection(collectionPath: string) {
    mockCollection(collectionPath);
    return new EnhancedCollectionReference(`${this.path}/${collectionPath}`);
  }
}

class EnhancedQuery extends Query {
  constructor(path: string) {
    super(path);
  }

  where(field: string, operator: string, value: any) {
    mockWhere(field, operator, value);
    return super.where(field, operator, value) as EnhancedQuery;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    mockOrderBy(field, direction);
    return super.orderBy(field, direction) as EnhancedQuery;
  }

  limit(n: number) {
    mockLimit(n);
    return super.limit(n) as EnhancedQuery;
  }

  async get() {
    mockGet();
    return super.get();
  }
}

class EnhancedCollectionReference extends EnhancedQuery {
  constructor(path: string) {
    super(path);
  }

  doc(docPath: string = '') {
    mockDoc(docPath);
    const fullPath = docPath ? `${this.path}/${docPath}` : `${this.path}/${Math.random().toString(36).substring(2, 15)}`;
    return new EnhancedDocumentReference(fullPath);
  }

  async add(data: any) {
    mockAdd(data);
    const docRef = this.doc() as EnhancedDocumentReference;
    await docRef.set(data);
    return docRef;
  }
}

// Mock Firestore
export const db = {
  collection: (path: string) => {
    mockCollection(path);
    return new EnhancedCollectionReference(path);
  },
  doc: (path: string) => {
    mockDoc(path);
    return new EnhancedDocumentReference(path);
  },
};

// Export the mock functions for test assertions
export const mockFirestore = {
  collection: mockCollection,
  doc: mockDoc,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  get: mockGet,
  add: mockAdd,
  set: mockSet,
  update: mockUpdate,
  delete: mockDelete,
  // Reset all mocks
  _reset: function() {
    mockCollection.mockClear();
    mockDoc.mockClear();
    mockWhere.mockClear();
    mockOrderBy.mockClear();
    mockLimit.mockClear();
    mockGet.mockClear();
    mockAdd.mockClear();
    mockSet.mockClear();
    mockUpdate.mockClear();
    mockDelete.mockClear();
  }
};

// Mock Firestore functions
export const getDoc = async (docRef: DocumentReference) => {
  return docRef.get();
};

export const getDocs = async (query: Query) => {
  return query.get();
};

export const setDoc = async (docRef: DocumentReference, data: any) => {
  return docRef.set(data);
};

export const updateDoc = async (docRef: DocumentReference, data: any) => {
  return docRef.update(data);
};

export const deleteDoc = async (docRef: DocumentReference) => {
  return docRef.delete();
};

export const addDoc = async (collectionRef: CollectionReference, data: any) => {
  return collectionRef.add(data);
};

export const query = (collectionRef: CollectionReference, ...constraints: any[]) => {
  let result: Query = collectionRef;
  for (const constraint of constraints) {
    if (constraint.type === 'where') {
      result = result.where(constraint.field, constraint.operator, constraint.value);
    } else if (constraint.type === 'orderBy') {
      result = result.orderBy(constraint.field, constraint.direction);
    } else if (constraint.type === 'limit') {
      result = result.limit(constraint.value);
    }
  }
  return result;
};

export const where = (field: string, operator: string, value: any) => {
  return { type: 'where', field, operator, value };
};

export const orderBy = (field: string, direction: 'asc' | 'desc' = 'asc') => {
  return { type: 'orderBy', field, direction };
};

export const limit = (n: number) => {
  return { type: 'limit', value: n };
};

export const collection = (db: any, path: string) => {
  return new CollectionReference(path);
};

export const doc = (dbOrCollection: any, path?: string) => {
  if (path) {
    return new DocumentReference(path);
  }
  return new DocumentReference(dbOrCollection);
};
