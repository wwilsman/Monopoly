import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import chai from 'chai';
import chaiDOM from 'chai-dom';
import chaiAsPromised from 'chai-as-promised';
import { describe, beforeEach, afterEach } from '@bigtest/mocha';
import Convergence from '@bigtest/convergence';

import { createGameState, transformGameState } from '../helpers';
import WebSocket from './mock-websocket';
import GameRoom from '../../server/room';
import connectSocket from '../../server/socket';
import AppRoot from '../../app/root';

import CONFIG_FIXTURE from '../../server/themes/classic/config.yml';
import PROPERTY_FIXTURES from '../../server/themes/classic/properties.yml';
import MESSAGES_FIXTURE from '../../server/themes/classic/messages.yml';

// use chai dom matchers
chai.use(chaiDOM);
// and chai as promised
chai.use(chaiAsPromised);

// always use fixtures for themes
GameRoom.set('loader', (theme, name) => {
  switch (name) {
    case 'config': return CONFIG_FIXTURE;
    case 'properties': return PROPERTY_FIXTURES;
    case 'messages': return MESSAGES_FIXTURE;
  }
});

// mock the global WebSocket class
window.WebSocket = WebSocket;

// mock the global localStorage interface
Object.defineProperty(window, 'localStorage', {
  value: {
    data: {},
    setItem(key, string) {
      this.data[key] = JSON.parse(string);
    },
    getItem(key) {
      return JSON.stringify(this.data[key]);
    },
    clear() {
      this.data = {};
    }
  }
});

/**
 * Visits a path using the provided push function and returns
 * a convergence instance
 * @param {Function} push - function to push the current history
 * @param {Mixed} path - the argument provided to `push`
 * @returns {Convergence}
 */
function visit(push, path) {
  return new Convergence().do(() => push(path));
}

/**
 * Navigates backwards by calling the provided goBack function and
 * returns a convergence instance
 * @param {Function} goBack - function to go back in the current history
 * @returns {Convergence}
 */
function goBack(goBack) {
  return new Convergence().do(() => goBack());
}

/**
 * Emits an event on behalf of the socket after 1ms to ensure other
 * events have been received first
 * @param {WebSocket} ws - WebSocket instance
 * @param {String} event - event name
 * @param {Mixed} ...args - arguments to emit
 */
function emit(ws, event, ...args) {
  window.setTimeout(() => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ event, args }));
    }
  }, 1);
}

/**
 * Starts a mock websocket server and mounts our app
 * @param {String} name - name of the test suite
 * @param {Function} setup - suite definition
 * @param {Boolean} only - use describe.only
 */
export function describeApplication(name, setup, only) {
  let descr = only ? describe.only : describe;

  descr(name, function() {
    let rootElement, unsubscribeFromStore;

    // mock a basic game
    mockGame();

    // app setup
    beforeEach(function() {

      // create the app root DOM node
      rootElement = document.createElement('div');
      rootElement.id = 'testing-root';
      document.body.appendChild(rootElement);

      // setup a mock websocket server
      this.io = new WebSocket.Server(`ws://${window.location.host}`);
      this.io.on('connection', connectSocket);

      // reference the mocked localStorage data
      this.localStorage = window.localStorage.data;

      // mount our app
      this.app = render(<AppRoot test/>, rootElement);

      // useful things to assert against
      this.state = this.app.store.getState();
      this.location = this.state.router.location;

      // keep local contexts up to date with the app
      unsubscribeFromStore = this.app.store.subscribe(() => {
        this.state = this.app.store.getState();
        this.location = this.state.router.location;
      });

      // helpers specific to this context
      this.visit = visit.bind(this, this.app.history.push);
      this.goBack = goBack.bind(this, this.app.history.goBack);
      this.emit = emit.bind(this, this.app.socket);

      // wait until our app has finished loading
      return new Convergence().once(() => {
        chai.expect(this.state.app.waiting).to.not.include('connected');
      });
    });

    // teardown
    afterEach(function() {
      unsubscribeFromStore();
      unsubscribeFromStore = null;

      unmountComponentAtNode(rootElement);
      document.body.removeChild(rootElement);
      rootElement = null;

      window.localStorage.clear();
      this.io.close();

      // sometimes our context can hang around
      this.visit = null;
      this.pauseTest = null;
      this.location = null;
      this.state = null;
      this.app = null;
      this.localStorage = null;
      this.io = null;
    });

    // passthrough to our tests
    setup.call(this);
  });
}

// convenience helper for describe.only
describeApplication.only = (name, setup) => {
  describeApplication(name, setup, true);
};

/**
 * Creates a mock game to test against.
 * Preserves any previous existing game.
 * @param {String} [id="t35tt"] - Game ID
 * @param {Object} [state={}] - Game state transforms
 * @param {Object} [config={}] - Custom game configuration
 */
export function mockGame({
  id = 't35tt',
  state = {},
  config = {}
} = {}) {
  let old;

  config = { ...CONFIG_FIXTURE, ...config };
  state = transformGameState(
    createGameState(PROPERTY_FIXTURES, config),
    state, config
  );

  beforeEach(function() {
    let game = {
      id,
      theme: 'classic',
      game: state,
      config
    };

    old = GameRoom.database.store[id];
    GameRoom.database.store[id] = game;

    Object.defineProperty(this, 'room', {
      configurable: true,
      get() {
        let room = GameRoom._cache[id] || new GameRoom(game);
        GameRoom._cache[id] = room;
        return room;
      }
    });

    if (this.room.refresh) {
      this.room.refresh();
    }
  });

  afterEach(function() {
    if (old) {
      GameRoom.database.store[id] = old;
      old = null;
    } else {
      delete GameRoom._cache[id];
      delete GameRoom.database.store[id];
    }
  });
}
