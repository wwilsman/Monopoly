import { createStore, applyMiddleware, compose } from 'redux'
import createLogger from 'redux-logger'
import io from 'socket.io-client'

import socketMiddleware from '../actions/sockets'
import toasterMiddleware from '../actions/toasts'
import rootReducer from '../reducers'

const loggerMiddleware = createLogger()
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const configureStore = (initialState = {}) => {
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(
      applyMiddleware(
        socketMiddleware,
        toasterMiddleware,
        loggerMiddleware
      )
    )
  )

  if (module.hot) {
    module.hot.accept('../reducers', () => {
      store.replaceReducer(rootReducer)
    })
  }

  return store
}

export default configureStore
