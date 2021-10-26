describe('Navigation', () => {
  it('Contains Tailwind', () => {
    cy.visit('/')
    cy.contains('Tailwind').should('be.visible')
    cy.contains('Semantic').should('be.visible')
    cy.contains('Packages').should('be.visible')
  })
})
