import { applyMiddleware, createStore } from 'redux';

import gameReducer from './reducers';
import gameMiddleware from './middleware';
import gameRules from './rules';
import createSelectors from './selectors';

/**
 * Creates a new store instance for games
 * @param {Object} initialState - Initial game state
 * @param {Object} config - Game config options
 * @param {Object} notices - Map of game notices
 * @returns {Object} Redux Store object
 */
export default (initialState, config, notices) => {
  return createStore(
    gameReducer,
    initialState,
    applyMiddleware(
      gameMiddleware({
        rules: gameRules,
        selectors: createSelectors(config),
        notices
      })
    )
  );
};