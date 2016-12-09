import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { configureStore } from './store'

import {
  Welcome
} from '../welcome'

import {
  NewGame,
  GameContainer,
  JoinGameContainer
} from '../game'

const store = configureStore({})
const history = syncHistoryWithStore(browserHistory, store)

export const Root = () => (
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={Welcome}/>
      <Route path="/new" component={NewGame}/>
      <Route path="/:gameID" component={GameContainer}>
        <Route path="/:gameID/join" component={JoinGameContainer}/>
      </Route>
    </Router>
  </Provider>
)
