describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to login page', () => {
    cy.get('a[href*="login"]').click();
    cy.url().should('include', '/login');
    cy.get('h1').should('contain', 'Sign In');
  });

  it('should show validation errors on login form', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.get('form').should('contain', 'required');
  });

  it('should navigate to register page', () => {
    cy.visit('/login');
    cy.get('a[href*="register"]').click();
    cy.url().should('include', '/register');
    cy.get('h1').should('contain', 'Create Account');
  });

  it('should show validation errors on register form', () => {
    cy.visit('/register');
    cy.get('button[type="submit"]').click();
    cy.get('form').should('contain', 'required');
  });

  it('should login with valid credentials', () => {
    // This test uses a custom command defined in commands.ts
    // You'll need to set up a test user in your test environment
    cy.login('test@example.com', 'password123');
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="user-menu"]').should('be.visible');
  });

  it('should logout successfully', () => {
    cy.login('test@example.com', 'password123');
    cy.get('[data-cy="user-menu"]').click();
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should('include', '/login');
  });
});
