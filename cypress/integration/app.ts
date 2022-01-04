describe('Navigation', () => {
  beforeEach(() => {
    // @ts-ignore
    // cy.login({ user: Cypress.env().user, password: Cypress.env().password })
  })

  it.skip('Can login', () => {
    cy.visit('/')
    // @ts-ignore 'login' is defined in cypress commands.js
    cy.login(Cypress.env().user, Cypress.env().password)
    cy.contains('User home')
  })

  it('Contains Tailwind', () => {
    cy.visit('/')
    cy.contains('Tailwind')
  })

  it('Contains Semantic', () => {
    cy.visit('/')
    cy.contains('Semantic')
  })

  it('Contains Packages', () => {
    cy.visit('/')
    cy.contains('Packages')
  })

  it('Navigates to somewhere else', () => {
    cy.visit('/')
    cy.get('.header').click()
    cy.url().should('contain', '/')
    cy.wait(200)
    cy.contains('Tailwind')
  })
})
