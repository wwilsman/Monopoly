import {
  JOIN_GAME,
  MAKE_TRANSFER_TO,
  MAKE_TRANSFER_FROM,
  MAKE_TRANSFER_WITH,
  CLAIM_BANKRUPTCY
} from '../actions/players';
import {
  BUY_PROPERTY,
  IMPROVE_PROPERTY,
  UNIMPROVE_PROPERTY,
  UNIMPROVE_GROUP,
  MORTGAGE_PROPERTY,
  UNMORTGAGE_PROPERTY,
  PAY_RENT
} from '../actions/properties';
import {
  CLOSE_AUCTION
} from '../actions/auction';
import {
  ACCEPT_OFFER
} from '../actions/trades';

/**
 * Reducer for a single player
 * @param {Object} state - Player state
 * @param {Object} action - Redux action
 * @returns {Object} Reduced state
 */
const player = (state, action) => {
  switch (action.type) {
    case JOIN_GAME:
      return {
        name: action.player.name,
        token: action.player.token,
        balance: action.amount,
        bankrupt: false
      };

    case MAKE_TRANSFER_TO:
    case UNIMPROVE_PROPERTY:
    case UNIMPROVE_GROUP:
    case MORTGAGE_PROPERTY:
      return { ...state,
        balance: state.balance + action.amount
      };

    case BUY_PROPERTY:
    case MAKE_TRANSFER_FROM:
    case IMPROVE_PROPERTY:
    case UNMORTGAGE_PROPERTY:
    case CLOSE_AUCTION:
      return { ...state,
        balance: state.balance - action.amount
      };

    case PAY_RENT:
    case MAKE_TRANSFER_WITH:
    case ACCEPT_OFFER:
      return { ...state,
        balance: state.token === action.other.token ?
          state.balance + action.amount :
          state.balance - action.amount
      };

    case CLAIM_BANKRUPTCY:
      return { ...state,
        balance: state.token === action.other.token ?
          state.balance + action.amount :
          state.balance - action.amount,
        bankrupt: state.token === action.player.token
      };

    default:
      return state;
  }
};

/**
 * Players reducer
 * @param {Object} state - Map of players keyed by token
 * @param {Object} action - Redux action
 * @returns {Object} Reduced state
 */
export default (state = {}, action) => {
  switch (action.type) {
    case JOIN_GAME:
      return { ...state,
        _all: [...state._all, action.player.token],
        [action.player.token]: player(undefined, action)
      };

    case BUY_PROPERTY:
    case MAKE_TRANSFER_TO:
    case MAKE_TRANSFER_FROM:
    case IMPROVE_PROPERTY:
    case UNIMPROVE_PROPERTY:
    case UNIMPROVE_GROUP:
    case MORTGAGE_PROPERTY:
    case UNMORTGAGE_PROPERTY:
    case CLOSE_AUCTION:
      return { ...state,
        [action.player.token]: player(state[action.player.token], action)
      };

    case PAY_RENT:
    case MAKE_TRANSFER_WITH:
    case ACCEPT_OFFER:
      return { ...state,
        [action.player.token]: player(state[action.player.token], action),
        [action.other.token]: player(state[action.other.token], action)
      };

    case CLAIM_BANKRUPTCY:
      state = { ...state,
        [action.player.token]: player(state[action.player.token], action)
      };

      return action.other.token === 'bank' ? state : { ...state,
        [action.other.token]: player(state[action.other.token], action)
      };

    default:
      return state;
  }
};