// we'll use 'history' that is been used by 'react-router-dom'
import { createEpicMiddleware } from 'redux-observable'
import { createStore, applyMiddleware } from 'redux'
import { routerMiddleware } from 'connected-react-router'

import history from './history'
import rootReducerCreator, { epics } from '../src/reducers'

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

const store = createStore(
  rootReducerCreator(history),
  {},
  /* istanbul ignore next */
  module.hot && window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
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
  const hotReloadingEpic = (...args) => epic$.pipe(switchMap((epic) => epic(...args)))
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

export default store
