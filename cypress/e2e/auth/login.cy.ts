// Authentication E2E test
describe('Authentication Flow', () => {
  beforeEach(() => {
    // Intercept Firebase auth calls
    cy.intercept('POST', '**/identitytoolkit/v3/relyingparty/verifyPassword*', {
      statusCode: 200,
      body: {
        kind: 'identitytoolkit#VerifyPasswordResponse',
        localId: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        idToken: 'fake-id-token',
        registered: true,
      }
    }).as('signIn');
    
    // Intercept session cookie API call
    cy.intercept('POST', '/api/auth/session', {
      statusCode: 200,
      body: { success: true }
    }).as('sessionCookie');
    
    // Intercept Firestore user data call
    cy.intercept('POST', '**/documents/users/**', {
      statusCode: 200,
      body: {
        fields: {
          name: { stringValue: 'Test User' },
          email: { stringValue: 'test@example.com' },
          role: { stringValue: 'user' },
          createdAt: { timestampValue: new Date().toISOString() }
        }
      }
    }).as('userData');
  });

  it('should successfully log in and redirect to dashboard', () => {
    // Visit login page
    cy.visit('/auth/signin');
    
    // Verify page content
    cy.contains('Sign in to your account').should('be.visible');
    
    // Fill in login form
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for auth request to complete
    cy.wait('@signIn');
    cy.wait('@sessionCookie');
    
    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Verify dashboard content
    cy.contains('Welcome, Test User').should('be.visible');
  });

  it('should display error message with invalid credentials', () => {
    // Override the auth intercept for this test
    cy.intercept('POST', '**/identitytoolkit/v3/relyingparty/verifyPassword*', {
      statusCode: 400,
      body: {
        error: {
          code: 400,
          message: 'INVALID_PASSWORD',
          errors: [
            {
              message: 'INVALID_PASSWORD'
            }
          ]
        }
      }
    }).as('signInError');
    
    // Visit login page
    cy.visit('/auth/signin');
    
    // Fill in login form with invalid credentials
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for auth request to complete
    cy.wait('@signInError');
    
    // Verify error message is displayed
    cy.contains('Invalid email or password').should('be.visible');
    
    // Verify we remain on the login page
    cy.url().should('include', '/auth/signin');
  });

  it('should navigate to signup page when clicking register link', () => {
    // Visit login page
    cy.visit('/auth/signin');
    
    // Click on signup link
    cy.contains('Create an account').click();
    
    // Verify redirect to signup page
    cy.url().should('include', '/auth/signup');
    
    // Verify signup page content
    cy.contains('Create an account').should('be.visible');
  });

  it('should navigate to password reset page when clicking forgot password', () => {
    // Visit login page
    cy.visit('/auth/signin');
    
    // Click on forgot password link
    cy.contains('Forgot your password?').click();
    
    // Verify redirect to password reset page
    cy.url().should('include', '/auth/reset-password');
    
    // Verify password reset page content
    cy.contains('Reset your password').should('be.visible');
  });

  it('should persist login session across page refreshes', () => {
    // Setup localStorage mock for Firebase auth persistence
    cy.window().then((win) => {
      win.localStorage.setItem('firebase:authUser', JSON.stringify({
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User'
      }));
    });
    
    // Visit dashboard directly
    cy.visit('/dashboard');
    
    // Verify we stay on dashboard (not redirected to login)
    cy.url().should('include', '/dashboard');
    
    // Verify user info is displayed
    cy.contains('Welcome, Test User').should('be.visible');
  });
});
