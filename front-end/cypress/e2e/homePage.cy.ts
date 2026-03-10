describe('Home Page', () => {
  const appUrl = 'http://localhost:3005';

  beforeEach(() => {
    cy.visit(appUrl);
  });

  it('loads home page and shows core sections', () => {
    cy.contains('Catalogue').should('be.visible');
    cy.contains('FAQ').should('be.visible');
    cy.contains('Login').should('be.visible');
    cy.contains('20 years of trust.').should('be.visible');
    cy.get('.marquee-track').should('exist');
  });

  it('opens and closes login chooser modal', () => {
    cy.contains('button', 'Login').click();
    cy.contains('Choose Login').should('be.visible');
    cy.contains('Customer Login').should('be.visible');
    cy.contains('Admin Login').should('be.visible');
    cy.get('button[aria-label="Close login selector"]').click();
    cy.contains('Choose Login').should('not.exist');
  });

  it('toggles theme', () => {
    cy.get('button[aria-label="Switch to dark mode"]').click();
    cy.get('html').should('have.class', 'dark');
    cy.get('button[aria-label="Switch to light mode"]').click();
    cy.get('html').should('not.have.class', 'dark');
  });

  it('persists selected theme after page reload', () => {
    cy.visit(appUrl);
    cy.get('button[aria-label="Switch to dark mode"]').click();
    cy.get('html').should('have.class', 'dark');
    cy.reload();
    cy.get('html').should('have.class', 'dark');
    cy.get('button[aria-label="Switch to light mode"]').should('be.visible');
  });
});
