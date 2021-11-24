const ADD_FILTER = 'filters/ADD'
const REMOVE_FILTER = 'filters/REMOVE'

export function addFilterAction (filter) {
  return { type: ADD_FILTER, filter }
}

export function removeFilterAction (filter) {
  return { type: REMOVE_FILTER, filter }
}

export default function (state = [], action) {
  if (action.type === ADD_FILTER) {
    if (state.includes(action.filter)) return state
    return [...state, action.filter]
  }
  if (action.type === REMOVE_FILTER) {
    const index = state.indexOf(action.filter)
    if (index < 0) return state
    const newState = [...state]
    newState.splice(index, 1)
    return newState
  }
  return state
}
