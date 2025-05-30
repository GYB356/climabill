// Mock next-auth for testing
const nextAuth = jest.fn(() => {
  return {
    auth: {
      user: {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
});

const getServerSession = jest.fn().mockResolvedValue({
  user: {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    isAdmin: false,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

module.exports = {
  default: nextAuth,
  getServerSession,
};
