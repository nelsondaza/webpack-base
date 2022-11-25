/// <reference types="cypress" />

import { getRoles, logRoles } from '@testing-library/dom'

// ***********************************************
// This example commands.ts shows you how to
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
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add(
  'login',
  ({
    cacheSession = true,
    password = String(Cypress.env().password),
    role = 'Administrador',
    user = String(Cypress.env().user),
  }: LoginParams) => {
    cy.intercept('/api/seguridad/me').as('login')
    cy.intercept('/api/seguridad/empresa/*').as('company')

    const login = () => {
      // https://docs.cypress.io/api/commands/session#Updating-an-existing-login-custom-command
      cy.visit('/')
      cy.findByPlaceholderText('E-mail').type(user)
      cy.findByPlaceholderText('Contraseña 6+').type(password)
      cy.findByRole('button', { name: 'Ingresar' }).click()

      cy.wait('@login')
      cy.wait('@company')
      cy.get('.SectionHeader').contains('Agenda')
    }
    if (cacheSession) {
      cy.session([user, password], login)
    } else {
      login()
    }

    cy.changeRole(role)
  },
)

Cypress.Commands.add('changeRole', (roleName: string) => {
  cy.intercept('/api/seguridad/me').as('login')
  cy.intercept('/api/seguridad/empresa/*').as('company')

  cy.get('body').then(($body) => {
    if ($body.find('.MainMenu__user__role__dropdown__text').length === 0) {
      cy.visit('/')
      cy.wait('@login')
      cy.wait('@company')
    }

    cy.get('.MainMenu__user__role__dropdown__text').then(($el) => {
      if ($el.text() !== roleName) {
        cy.get('.MainMenu__user__role').click()
        cy.get('div[role="option"]').contains(roleName).click()
        cy.wait('@login')
        cy.wait('@company')
      }

      cy.get('.MainMenu__user__role__dropdown__text').contains(roleName)
    })
  })
})

Cypress.Commands.add('roles', () => {
  const body = Cypress.$('body').get(0)
  const roles = getRoles(body)
  logRoles(body)

  Cypress.log({
    name: 'roles',
    displayName: 'Roles List',
    message: Object.entries(roles)
      .filter(([role]) => role !== 'generic')
      .map(([role, value]) => `${role} (${value.length})`)
      .join(', '),
    consoleProps: () => ({ roles }),
  })

  return roles
})

Cypress.Commands.add('any', { prevSubject: true }, (subject: JQuery<HTMLElement>, size = 1) => {
  cy.wrap(subject).then((elementList) => {
    let list = elementList.jquery ? elementList.get() : elementList
    list = Cypress._.sampleSize(list, Math.min(size, 1))
    const element = list.length > 1 ? list : list[0]
    cy.wrap(element)
  })
})

export {}
