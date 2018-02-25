import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import {
  createBrowserHistory,
  createMemoryHistory
} from 'history';

import './styles/global.css';
import createStore from './redux/store';

import AppScreen from './screens/app';
import WelcomeScreen from './screens/welcome';
import FindRoomScreen from './screens/find-room';
import JoinGameScreen from './screens/join-game';
import GameRoomScreen from './screens/game-room';
import DashboardScreen from './screens/dashboard';
import SandboxScreen from './screens/sandbox';

class AppRoot extends Component {
  static propTypes = {
    test: PropTypes.bool
  };

  history = !this.props.test ?
    createBrowserHistory() :
    createMemoryHistory();

  socket = new WebSocket(
    `ws://${window.location.host}`
  );

  store = createStore({
    socket: this.socket,
    history: this.history
  });

  render() {
    let roompath = ':room([^/]{5})';

    return (
      <Provider store={this.store}>
        <AppScreen path="/(.*)" redirect="/">
          <WelcomeScreen path="/"/>
          <FindRoomScreen path="/join"/>
          <JoinGameScreen path={`/${roompath}/join`}/>

          <GameRoomScreen path={`/${roompath}`}>
            <DashboardScreen path={`/${roompath}`}/>
          </GameRoomScreen>

          {process.env.NODE_ENV === 'development' && (
            <SandboxScreen path="/sandbox"/>
          )}
        </AppScreen>
      </Provider>
    );
  }
}

export default AppRoot;