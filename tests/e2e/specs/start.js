// https://docs.cypress.io/api/introduction/api.html

describe('Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/');
    cy.contains('h2', 'This webapp is in development');
  });
});
