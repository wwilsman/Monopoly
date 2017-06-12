import slug from 'slug';
import {
  before,
  after,
  beforeEach,
  afterEach
} from 'mocha';

import {
  createGame
} from '../../server/game';
import {
  getPlayer,
  getProperty,
  getProperties
} from '../../server/helpers';
import {
  GAME_FIXTURE,
  CONFIG_FIXTURE
} from '../fixtures';

/**
 * Sets up testing context for a new game store instance each test
 * @param {Object} [state] - Initial game state to merge with fixture
 * @param {Object} [config] - Game configuration to merge with fixture
 */
export function setupGameForTesting({ state = {}, config = {} } = {}) {
  before(function() {
    this.config = { ...CONFIG_FIXTURE, ...config };
    this.initial = extendGameState(GAME_FIXTURE, state, this.config);
  });

  after(function() {
    this.initial = null;
    this.config = null;
  });

  setupGameStore();
}

/**
 * Modifies the current game state before the store is instantiated.
 * Retains and restores the previous game state
 * @param {Object} [state] - Initial game state to merge with fixture
 * @param {Object} [config] - Game configuration to merge with fixture
 */
export function modifyGameInTesting({ state = {}, config = {} } = {}) {
  let old = {};

  before(function() {
    old.initial = this.initial;
    old.config = this.config;

    this.config = { ...old.config, ...config };
    this.initial = extendGameState(this.initial, state, this.config);
  });

  after(function() {
    this.initial = old.initial;
    this.config = old.config;
    old = null;
  });

  setupGameStore();
}

/**
 * Sets up the game store instance for testing and preserves/restores
 * any previous instances.
 */
function setupGameStore() {
  let store, unsubscribe, old = {};

  beforeEach(function() {
    old.last = this.last;
    old.state = this.state;
    old.dispatch = this.dispatch;
    old.getPlayer = this.getPlayer;
    old.getProperty = this.getProperty;
    old.getProperties = this.getProperties;

    store = createGame(this.initial, this.config);

    this.state = store.getState();
    this.dispatch = store.dispatch;

    unsubscribe = store.subscribe(() => {
      this.last = this.state;
      this.state = store.getState();
    });

    this.getPlayer = (id) => getPlayer(this.state, id);
    this.getProperty = (id) => getProperty(this.state, id);
    this.getProperties = (group) => getProperties(this.state, group);
  });

  afterEach(function() {
    this.last = old.last;
    this.state = old.state;
    this.dispatch = old.dispatch;
    this.getPlayer = old.getPlayer;
    this.getProperty = old.getProperty;
    this.getProperties = old.getProperties;

    unsubscribe();
    unsubscribe = null;
    store = null;
  });
}

/**
 * Builds the initial state for testing by overriding state and property
 * defaults from fixtures and creating new players
 * @param {Object} state - The state overrides
 * @param {[Object]} state.players - Array of players to create
 * @param {[Object]} state.properties - Array of properties or groups to override
 * @param {Object} config - configuration needed during game creation
 * @returns {Object} A new initial state for testing
 */
function extendGameState(state, overrides, config) {
  return {
    ...state,
    ...overrides,

    // override existing players by id or create new ones
    players: (overrides.players||[]).reduce((players, override) => {
      if (override.id && players.find((pl) => pl.id === override.id)) {
        return players.map((player) => (player.id === override.id ? {
          ...player, ...override
        } : player));
      }

      const name = override.name || `Player ${players.length + 1}`;
      const token = override.token || config.playerTokens.find((t) => (
        !players.find((pl) => pl.token === t)
      ));

      return [...players, {
        id: override.id || slug(`${name}_${token}`),
        balance: override.balance || config.playerStart,
        bankrupt: override.bankrupt || false,
        name, token
      }];
    }, state.players),

    // override existing properties by id or group
    properties: (overrides.properties||[]).reduce((properties, override) => {
      return properties.map((property) => (
        (property.id === override.id || property.group === override.group) ? {
          ...property, ...override
        } : property
      ));
    }, state.properties)
  };
}
