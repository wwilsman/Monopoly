import {
  before,
  beforeEach,
  afterEach
} from 'mocha';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import ioServer from 'socket.io';
import ioClient from 'socket.io-client';

import GameRoom from '../../server/room';
import connectSocket from '../../server/socket';
import MonopolyError from '../../server/error';
import { extendGameState } from './game-helpers';

import {
  GAME_FIXTURE,
  CONFIG_FIXTURE
} from './fixtures';

// use chai as promised
chai.use(chaiAsPromised);

// mock database layer for our game room
GameRoom.persist({
  _store: {},

  find(id) {
    return this._store[id] ?
      Promise.resolve(this._store[id]) :
      Promise.reject(new MonopolyError('Game not found'));
  },

  save(doc) {
    this._store[doc.id] = doc;
    return Promise.resolve(doc);
  }
});

/**
 * Starts the server, adds mock data, and sets up a number of sockets
 * @param {Object} [game={}] - Initial game state to merge with fixture
 * @param {Object} [config={}] - Game configuration to merge with fixture
 * @param {Function} [beforeEach] - Before each callback
 */
export function setupRoomForTesting({
  game = {},
  config = {},
  beforeEach:beforeEachCB,
  afterEach:afterEachCB
} = {}) {
  let server = null;
  let gameID = 't35tt';

  before(function() {
    this.room = gameID.toUpperCase();
    this.config = { ...CONFIG_FIXTURE, ...config };
    this.game = extendGameState(GAME_FIXTURE, game, this.config);
  });

  beforeEach(async function() {
    server = ioServer(8080);
    server.on('connection', connectSocket);

    GameRoom.db._store[gameID] = {
      id: gameID,
      state: this.game,
      config: this.config
    };

    if (beforeEachCB) {
      await beforeEachCB.call(this);
    }
  });

  afterEach(async function() {
    if (afterEachCB) {
      await afterEachCB.call(this);
    }

    return new Promise((resolve) => {
      delete GameRoom.db._store[gameID];
      server.close(resolve);
    });
  });
}

/**
 * Creates a new socket instance
 * @returns {Socket} Socket.io socket instance
 */
export function createSocket() {
  return ioClient('http://localhost:8080', {
    transports: ['websocket'],
    forceNew: true
  });
}

/**
 * Connects a socket to a game room
 * @param {Socket} socket - Socket.io socket instance
 * @param {String} gameID - Game room ID
 * @returns {Promise} Resolves once connected
 */
export function connectToGameRoom(socket, gameID) {
  return promisifySocketEvent(socket, {
    emit: 'room:connect',
    resolve: 'room:connected',
    reject: 'room:error'
  })(gameID);
}

/**
 * Promisifies a socket emit event that resolves or rejects on other events
 * @param {Socket} socket - Socket.io socket instance
 * @param {String} emitEvent - Event name to emit when the return function is called
 * @param {String} resolveEvent - Event name to resolve the resulting promise
 * @param {String} rejectEvent - Event name to reject the resulting promise
 * @returns {Function} Called with event args will return a promise that
 * resolves or rejects on option events
 */
export function promisifySocketEvent(socket, {
  emit:emitEvent,
  resolve:resolveEvent,
  reject:rejectEvent
}) {
  return (...args) => new Promise((resolve, reject) => {
    const handleResolve = (...payload) => off() && resolve(...payload);
    const handleReject = (error) => off() && reject(createError(error));

    const off = () => socket
      .off(resolveEvent, handleResolve)
      .off(rejectEvent, handleReject);

    socket.on(resolveEvent, handleResolve);
    socket.on(rejectEvent, handleReject);
    socket.emit(emitEvent, ...args);
  });
}

/**
 * Helper that creates a new error from error-like objects
 * @param {Object} error - Error-like object with `name` and `message` properties
 * @returns {Error} A new error instance
 */
function createError(error) {
  let Err;

  if (typeof error === 'string') {
    error = { name: 'Error', message: error };
  }

  if (error.name === 'MonopolyError') {
    Err = MonopolyError;
  } else {
    Err = global[error.name] || Error;
  }

  return new Err(error.message);
}
