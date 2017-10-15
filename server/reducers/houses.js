import {
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY,
  UNIMPROVE_GROUP
} from '../actions/properties';

/**
 * Reducer for available houses
 * @param {Object} state - Current state to reduce
 * @param {Object} action - Redux action
 * @returns {Object} Reduced state
 */
export default (state = Infinity, action) => {
  switch (action.type) {
    case IMPROVE_PROPERTY:
    case UNIMPROVE_PROPERTY:
    case UNIMPROVE_GROUP:
      return state - action.houses;

    default:
      return state;
  }
};
