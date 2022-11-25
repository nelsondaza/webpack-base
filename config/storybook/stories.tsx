import { ConnectedRouter } from 'connected-react-router'
import { ReactNode } from 'react'
import { Provider } from 'react-redux'

import history from '../history'
import store from '../store'

import '../assets/tailwind/tailwind.css'
import '../assets/semantic-ui/semantic.css'
import '../../src/globals.scss'
import './stories.css'

type StoriesHolderProps = {
  children: ReactNode
}

const StoriesHolder = ({ children }: StoriesHolderProps) => (
  <div className="StoriesContainer">
    <div className="StoriesContainer__holder">{children}</div>
  </div>
)

export const withEnvironment = (Story: JSX.IntrinsicAttributes) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <StoriesHolder>
        {/* @ts-ignore */}
        <Story />
      </StoriesHolder>
    </ConnectedRouter>
  </Provider>
)
