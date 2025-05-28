// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});

// -- Custom command for creating an invoice --
Cypress.Commands.add('createInvoice', (invoiceData: any) => {
  cy.visit('/invoices/new');
  cy.get('input[name="customerName"]').type(invoiceData.customerName);
  cy.get('input[name="invoiceNumber"]').type(invoiceData.invoiceNumber);
  cy.get('input[name="amount"]').type(invoiceData.amount.toString());
  cy.get('input[name="dueDate"]').type(invoiceData.dueDate);
  
  // Add line items
  if (invoiceData.items && invoiceData.items.length > 0) {
    invoiceData.items.forEach((item: any, index: number) => {
      if (index > 0) {
        cy.get('button[data-cy="add-item"]').click();
      }
      cy.get(`input[name="items[${index}].description"]`).type(item.description);
      cy.get(`input[name="items[${index}].quantity"]`).type(item.quantity.toString());
      cy.get(`input[name="items[${index}].unitPrice"]`).type(item.unitPrice.toString());
    });
  }
  
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/invoices/');
});

// -- Custom command for checking carbon offset --
Cypress.Commands.add('checkCarbonOffset', () => {
  cy.visit('/carbon');
  cy.get('[data-cy="carbon-usage"]').should('be.visible');
  cy.get('[data-cy="carbon-offset-button"]').click();
  cy.get('[data-cy="offset-modal"]').should('be.visible');
});

// -- Custom command for checking blockchain wallet --
Cypress.Commands.add('checkBlockchainWallet', () => {
  cy.visit('/blockchain/wallet');
  cy.get('[data-cy="wallet-list"]').should('be.visible');
});

// -- Custom command for checking accounting integration --
Cypress.Commands.add('checkAccountingIntegration', () => {
  cy.visit('/settings/integrations');
  cy.get('[data-cy="quickbooks-connect"]').should('be.visible');
  cy.get('[data-cy="xero-connect"]').should('be.visible');
});

// -- This is a child command --
Cypress.Commands.add('drag', { prevSubject: 'element' }, (subject, options) => {
  return cy.wrap(subject).trigger('mousedown', {
    which: 1,
    ...options,
  })
  .trigger('mousemove', {
    which: 1,
    ...options,
  })
  .trigger('mouseup', {
    which: 1,
    ...options,
  });
});

// -- This is a dual command --
Cypress.Commands.add('dismiss', { prevSubject: 'optional' }, (subject, options) => {
  return subject ? cy.wrap(subject).click() : cy.get('body');
});

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      createInvoice(invoiceData: any): Chainable<void>
      checkCarbonOffset(): Chainable<void>
      checkBlockchainWallet(): Chainable<void>
      checkAccountingIntegration(): Chainable<void>
      drag(options?: any): Chainable<Element>
      dismiss(options?: any): Chainable<Element>
    }
  }
}
