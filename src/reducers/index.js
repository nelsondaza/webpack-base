import { combineEpics } from 'redux-observable'
import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

// import { actions as company, registerReducer as companyReducer } from 'company'
//
// import authReducer from './AuthReducer'
// import * as auth from '../actions/AuthActions'

const state = {
  // auth: authReducer,
}

const reducersRegisterList = [
  //  companyReducer,
]

export default (appHistory) =>
  combineReducers({
    ...reducersRegisterList.reduce((store, reducer) => reducer(store), state),
    router: connectRouter(appHistory),
  })

// const filterEpics = (obj) => Object.keys(obj)
//   .filter((k) => k.endsWith('Epic'))
//   .map((k) => obj[k])

export const epics = combineEpics()
// ...filterEpics(auth),
