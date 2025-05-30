// This is a simple hook for authentication
export const useAuth = () => {
  return {
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    },
    isLoading: false,
    error: null,
    signIn: async () => {},
    signOut: async () => {},
    createUser: async () => {},
  };
};

export default useAuth;
