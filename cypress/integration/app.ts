describe('Navigation', () => {
  it('Contains calendar', () => {
    // @ts-ignore 'login' is defined in cypress commands.js
    cy.login(Cypress.env().user, Cypress.env().password)
    cy.contains('.rc-calendar-footer-btn')
  })

  it('Navigates to somewhere else', () => {
    cy.get(':nth-child(2) > > :nth-child(1)').click()
    cy.url().should('contain', '/somewhere/else/')
    cy.wait(200)
  })

  it('Some button shows a popup', () => {
    cy.contains('Some').click()
    cy.contains('Popup content')
  })
})
