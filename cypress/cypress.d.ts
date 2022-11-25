import type { mount } from 'cypress/react'

// import { MountOptions, MountReturn } from 'cypress/react'
// import { ReactNode } from 'react'
// import { MemoryRouterProps } from 'react-router-dom'
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       /**
//        * Mounts a React node
//        * @param component React Node to mount
//        * @param options Additional options to pass into mount
//        */
//       mount(
//         component: ReactNode,
//         options?: MountOptions & { routerProps?: MemoryRouterProps },
//       ): Cypress.Chainable<MountReturn>
//     }
//   }
// }

type AnyReturnType<Total> = Total extends 1 | undefined
  ? JQuery<HTMLElement>
  : Total extends number
  ? JQuery<HTMLElement>[]
  : never

declare global {
  type LoginParams = { user?: string; password?: string; cacheSession?: boolean; role?: string }

  namespace Cypress {
    interface Chainable {
      any: <Total extends number | undefined = undefined>(size?: Total) => Cypress.Chainable<AnyReturnType<Total>>
      changeRole(roleName: string): Chainable<void>
      login(credentials: LoginParams): Chainable<void>
      mount: typeof mount
      roles: () => {
        [index: string]: HTMLElement[]
      }
    }
  }
}
