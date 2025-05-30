// Mock Next.js server components
export class NextRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.body = options.body;
    this.headers = new Headers(options.headers || {});
    this.nextUrl = {
      pathname: new URL(url).pathname,
      searchParams: new URL(url).searchParams,
    };
  }

  json() {
    return Promise.resolve(this.body);
  }
}

export class NextResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.headers = options.headers || {};
  }

  static json(data, options = {}) {
    const response = new NextResponse(data, options);
    return response;
  }

  json() {
    return Promise.resolve(this.body);
  }
}

export const cookies = () => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
});

export const headers = () => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
});

// Mock params context for route handlers
export const createMockParams = (params = {}) => {
  return { params };
};
