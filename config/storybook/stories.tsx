import { Provider, useDispatch } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { ReactNode, useEffect } from 'react'

import history from '../history'
import store from '../store'

import '../assets/tailwind/tailwind.css'
import '../assets/semantic-ui/semantic.css'
import '../../src/globals.scss'
import './stories.css'

type StoriesHolderProps = {
  environmentSet?: () => { type: string; payload?: unknown }
  children: ReactNode
}

const StoriesHolder = ({
  children,
  environmentSet = () => ({ type: 'ENVIRONMENT_SET' }),
}: StoriesHolderProps) => {
  const dispatch = useDispatch()
  // @ts-ignore
  useEffect(() => dispatch(environmentSet()), [dispatch, environmentSet])

  return (
    <div className="StoriesContainer">
      <div className="StoriesContainer__holder">{children}</div>
    </div>
  )
}

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
