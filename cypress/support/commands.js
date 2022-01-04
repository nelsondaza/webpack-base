// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', ({ user, password, cacheSession = true }) => {
  // https://docs.cypress.io/api/commands/session#Updating-an-existing-login-custom-command
  const login = () => {
    cy.intercept('https://auth.serviceco/auth').as('login')

    cy.visit('/')
    cy.get('input[placeholder="E-mail"]').type(user)
    cy.get('input[placeholder="Password"]').type(password)
    cy.get('button[type="submit"]').click()

    cy.wait('@login')
  }
  if (cacheSession) {
    cy.session([user, password], login)
  } else {
    login()
  }
})
