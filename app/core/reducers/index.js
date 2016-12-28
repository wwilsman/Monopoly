import { combineReducers } from 'redux'

import routerReducer from './router'
import { gameReducer, themeReducer } from '../../game/reducers'
import playerReducer from '../../player/reducer'

const rootReducer = combineReducers({
  routing: routerReducer,
  game: gameReducer,
  player: playerReducer,
  theme: themeReducer
})

export default rootReducer