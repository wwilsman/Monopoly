function routerReducer(state = {}, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        location: action.location,
        action: action.action
      }

    default:
      return state
  }
}

export default routerReducer