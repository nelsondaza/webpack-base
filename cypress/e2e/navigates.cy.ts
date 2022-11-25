describe('navigates', () => {
  it('navigates', () => {
    cy.visit('/')
    cy.contains('Webpack Base App Name')
  })
})
