import { configureStore } from '@reduxjs/toolkit'
import { routerMiddleware } from 'connected-react-router'
import { applyMiddleware, compose, createStore } from 'redux'
import { createEpicMiddleware } from 'redux-observable'

import { USE_REDUX_TOOLS } from 'system'

import rootReducerCreator, { epics } from '../src/reducers'

import history from './history'

const epicMiddleWare = createEpicMiddleware()
const middlewares = [epicMiddleWare, routerMiddleware(history)]

/* istanbul ignore next */
if (module.hot) {
  // Adds the logger
  middlewares.push(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('redux-logger').createLogger({
      // collapse all
      collapsed: () => true,
    }),
  )
}

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose
  }
}

const store = USE_REDUX_TOOLS
  ? configureStore({
    reducer: rootReducerCreator(history),
    enhancers: [applyMiddleware(...middlewares)],
  })
  : createStore(
    rootReducerCreator(history),
    {},
    /* istanbul ignore next */
    module.hot && window?.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(applyMiddleware(...middlewares))
      : applyMiddleware(...middlewares),
  )

/* istanbul ignore next */
if (module.hot) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { BehaviorSubject, switchMap } = require('rxjs')
  const epic$ = new BehaviorSubject(epics)
  // Every time a new epic is given to epic$ it
  // will unsubscribe from the previous one then
  // call and subscribe to the new one because of
  // how switchMap works
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hotReloadingEpic = (...args: any) => epic$.pipe(switchMap((epic: any) => epic(...args)))
  epicMiddleWare.run(hotReloadingEpic)

  // Enable Webpack hot module replacement for reducers
  module.hot.accept('../src/reducers', () => {
    // Reducer replace
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const hotReducers = require('../src/reducers')
    // epicMiddleWare.replaceEpic(hotReducers.epics)
    store.replaceReducer(hotReducers.default(history))
    epic$.next(hotReducers.epics)
  })
} else {
  epicMiddleWare.run(epics)
}

declare global {
  type GlobalState = ReturnType<typeof store.getState>
  type GlobalDispatch = typeof store.dispatch
}

export default store
