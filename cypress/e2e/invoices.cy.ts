describe('Invoices', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.visit('/invoices');
  });

  it('should display the invoices list', () => {
    cy.get('[data-cy="invoices-list"]').should('be.visible');
    cy.get('h1').should('contain', 'Invoices');
  });

  it('should navigate to create invoice page', () => {
    cy.get('[data-cy="create-invoice-button"]').click();
    cy.url().should('include', '/invoices/new');
    cy.get('h1').should('contain', 'Create Invoice');
  });

  it('should create a new invoice', () => {
    // This test uses a custom command defined in commands.ts
    const invoiceData = {
      customerName: 'Test Customer',
      invoiceNumber: 'INV-' + Date.now(),
      amount: 100,
      dueDate: '2025-06-30',
      items: [
        {
          description: 'Test Item',
          quantity: 1,
          unitPrice: 100
        }
      ]
    };
    
    cy.createInvoice(invoiceData);
    cy.get('[data-cy="success-message"]').should('be.visible');
    cy.get('[data-cy="invoice-details"]').should('contain', invoiceData.invoiceNumber);
  });

  it('should filter invoices by status', () => {
    cy.get('[data-cy="filter-dropdown"]').click();
    cy.get('[data-cy="filter-paid"]').click();
    cy.get('[data-cy="invoices-list"]').should('be.visible');
    // Verify that the filtered results are showing
    cy.get('[data-cy="invoice-status"]').each(($el) => {
      expect($el.text()).to.include('Paid');
    });
  });

  it('should search for an invoice', () => {
    const searchTerm = 'INV-';
    cy.get('[data-cy="search-input"]').type(searchTerm);
    cy.get('[data-cy="search-button"]').click();
    cy.get('[data-cy="invoices-list"]').should('be.visible');
    cy.get('[data-cy="invoice-number"]').each(($el) => {
      expect($el.text()).to.include(searchTerm);
    });
  });

  it('should view invoice details', () => {
    cy.get('[data-cy="invoice-row"]').first().click();
    cy.url().should('include', '/invoices/');
    cy.get('[data-cy="invoice-details"]').should('be.visible');
    cy.get('[data-cy="invoice-items"]').should('be.visible');
  });

  it('should mark an invoice as paid', () => {
    cy.get('[data-cy="invoice-row"]').first().click();
    cy.get('[data-cy="mark-paid-button"]').click();
    cy.get('[data-cy="confirm-dialog"]').should('be.visible');
    cy.get('[data-cy="confirm-button"]').click();
    cy.get('[data-cy="invoice-status"]').should('contain', 'Paid');
  });

  it('should download an invoice PDF', () => {
    cy.get('[data-cy="invoice-row"]').first().click();
    cy.get('[data-cy="download-pdf-button"]').click();
    // Note: Cypress cannot actually test file downloads, but we can verify the button works
    cy.get('[data-cy="success-message"]').should('be.visible');
  });
});
